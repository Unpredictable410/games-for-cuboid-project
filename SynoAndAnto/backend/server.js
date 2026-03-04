const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev
        methods: ["GET", "POST"]
    }
});

// LOAD DICTIONARY
const WORDS_FILE = path.join(__dirname, 'data', 'words.txt');
let commonWords = [];

try {
    const data = fs.readFileSync(WORDS_FILE, 'utf8');
    commonWords = data.split('\n').map(w => w.trim()).filter(w => w.length >= 3 && w.length <= 10);
    console.log(`Loaded ${commonWords.length} common words.`);
} catch (err) {
    console.error("Failed to load words file:", err);
    commonWords = ['happy', 'sad', 'angry', 'fast', 'slow'];
}

// GAME STATE
const rooms = {};

// CACHE
const validCache = { syn: new Set(), ant: new Set() };
const invalidCache = { syn: new Set(), ant: new Set() };

// CONSTANTS
const DATAMUSE_API = 'https://api.datamuse.com/words';
const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// HELPERS
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
};

const getRandomWordRaw = (difficultyLevel = 0) => {
    const baseCount = 300;
    const increment = 300;
    let maxIndex = Math.min(commonWords.length, baseCount + (difficultyLevel * increment));
    const randomIndex = Math.floor(Math.random() * maxIndex);
    return commonWords[randomIndex];
};

const checkDictionaryApi = async (base, guess, type) => {
    try {
        const response = await axios.get(`${DICT_API}/${base}`);
        const data = response.data;
        let validWords = [];
        data.forEach(entry => {
            entry.meanings.forEach(meaning => {
                if (type === 'syn') {
                    validWords.push(...meaning.synonyms);
                } else {
                    validWords.push(...meaning.antonyms);
                }
            });
        });
        return validWords.map(w => w.toLowerCase()).includes(guess.toLowerCase());
    } catch (err) {
        return false;
    }
};

const hasRelationInDictApi = async (base, type) => {
    try {
        const response = await axios.get(`${DICT_API}/${base}`);
        const data = response.data;
        let count = 0;
        data.forEach(entry => {
            entry.meanings.forEach(meaning => {
                if (type === 'syn') {
                    count += meaning.synonyms.length;
                } else {
                    count += meaning.antonyms.length;
                }
            });
        });
        return count > 0;
    } catch (err) {
        return false;
    }
}

const checkDatamuseRelation = async (base, guess, type) => {
    try {
        const relCode = type === 'syn' ? 'rel_syn' : 'rel_ant';
        const response = await axios.get(`${DATAMUSE_API}?${relCode}=${base}`);
        let validWords = response.data.map(item => item.word);
        if (type === 'syn') {
            const mlResponse = await axios.get(`${DATAMUSE_API}?ml=${base}`);
            const mlWords = mlResponse.data.map(item => item.word);
            validWords = [...new Set([...validWords, ...mlWords])];
        }
        return validWords.includes(guess.toLowerCase());
    } catch (err) {
        console.error("Datamuse API Error:", err);
        return false;
    }
};

const hasRelationInDatamuse = async (base, type) => {
    try {
        const relCode = type === 'syn' ? 'rel_syn' : 'rel_ant';
        const response = await axios.get(`${DATAMUSE_API}?${relCode}=${base}`);
        return response.data.length > 0;
    } catch (err) {
        return false;
    }
};

const validateRelation = async (base, guess, type) => {
    const dictResult = await checkDictionaryApi(base, guess, type);
    if (dictResult) return true;
    return await checkDatamuseRelation(base, guess, type);
};

// SMART WORD GENERATOR
const getValidGameWord = async (mode, difficultyLevel) => {
    const type = mode || 'syn';
    const validSet = validCache[type];
    const invalidSet = invalidCache[type];

    for (let i = 0; i < 20; i++) {
        const word = getRandomWordRaw(difficultyLevel);
        if (validSet.has(word)) return word;
        if (invalidSet.has(word)) continue;
        const hasDict = await hasRelationInDictApi(word, type);
        if (hasDict) {
            validSet.add(word);
            return word;
        }
        const hasDatamuse = await hasRelationInDatamuse(word, type);
        if (hasDatamuse) {
            validSet.add(word);
            return word;
        }
        invalidSet.add(word);
    }
    return getRandomWordRaw(difficultyLevel);
};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', ({ nickname, maxPlayers }) => {
        const roomCode = generateRoomCode();
        rooms[roomCode] = {
            code: roomCode,
            maxPlayers: parseInt(maxPlayers) || 2,
            players: [{ id: socket.id, nickname, score: 0 }],
            gameState: 'LOBBY',
            currentWord: '',
            turnIndex: 0,
            gameMode: null,
            host: socket.id,
            gameRound: 0,
            difficultyLevel: 0,
            challengeOptions: [],
            incorrectGuesses: 0
        };
        socket.join(roomCode);
        socket.emit('room_created', { roomCode, userId: socket.id });
        io.to(roomCode).emit('update_room', rooms[roomCode]);
    });

    socket.on('join_room', ({ nickname, roomCode }) => {
        const room = rooms[roomCode];
        if (room && room.gameState === 'LOBBY' && room.players.length < room.maxPlayers) {
            room.players.push({ id: socket.id, nickname, score: 0 });
            socket.join(roomCode);
            io.to(roomCode).emit('update_room', room);
            socket.emit('joined_success', { roomCode, userId: socket.id });
        } else {
            socket.emit('error', { msg: 'Room not found or full' });
        }
    });

    socket.on('start_game', async ({ roomCode, mode }) => {
        const room = rooms[roomCode];
        if (room && room.host === socket.id && room.players.length >= 2) {
            // EMIT LOADING
            io.to(roomCode).emit('loading', { msg: 'Starting game... Finding valid word...' });

            room.gameState = 'GUESSING';
            room.gameMode = mode;
            room.gameRound = 1;
            room.difficultyLevel = 0;
            room.currentWord = await getValidGameWord(mode, room.difficultyLevel);
            room.turnIndex = 0;
            room.incorrectGuesses = 0;
            io.to(roomCode).emit('game_started', room);
        }
    });

    socket.on('submit_guess', async ({ roomCode, guess }) => {
        const room = rooms[roomCode];
        if (!room) return;

        const currentPlayer = room.players[room.turnIndex];
        if (socket.id !== currentPlayer.id) return;

        const isCorrect = await validateRelation(room.currentWord, guess, room.gameMode);

        if (isCorrect) {
            currentPlayer.score += 10;
            room.gameState = 'CHALLENGING';
            room.incorrectGuesses = 0;

            // EMIT LOADING
            io.to(roomCode).emit('loading', { msg: 'Correct! Generating challenge options...' });

            const options = [];
            const optionPromises = [];
            for (let i = 0; i < 3; i++) {
                optionPromises.push(getValidGameWord(room.gameMode, room.difficultyLevel));
            }
            room.challengeOptions = await Promise.all(optionPromises);

            io.to(roomCode).emit('guess_result', {
                success: true,
                msg: `${currentPlayer.nickname} guessed correctly! Choosing next word...`,
                room
            });
        } else {
            // HANDLE INCORRECT GUESS
            room.incorrectGuesses += 1;

            if (room.incorrectGuesses >= 3) {
                // EMIT LOADING
                io.to(roomCode).emit('loading', { msg: 'Too many wrong attempts... skipping...' });

                const newWord = await getValidGameWord(room.gameMode, room.difficultyLevel);
                room.currentWord = newWord;
                room.incorrectGuesses = 0;

                io.to(roomCode).emit('guess_result', {
                    success: false,
                    skipped: true,
                    msg: `Too many wrong attempts! Skipping to new word: ${newWord}`,
                    room
                });
            } else {
                room.turnIndex = (room.turnIndex + 1) % room.players.length;
                io.to(roomCode).emit('guess_result', {
                    success: false,
                    msg: `${currentPlayer.nickname} guessed wrong. Next player! (${room.incorrectGuesses}/3 attempts)`,
                    room
                });
            }
        }
    });

    socket.on('typing', ({ roomCode, text }) => {
        socket.to(roomCode).emit('player_typing', { userId: socket.id, text });
    });

    socket.on('submit_challenge', async ({ roomCode, word }) => {
        const room = rooms[roomCode];
        if (!room) return;
        const currentPlayer = room.players[room.turnIndex];
        if (socket.id !== currentPlayer.id) return;

        room.currentWord = word;
        room.gameState = 'GUESSING';
        room.challengeOptions = [];
        room.turnIndex = (room.turnIndex + 1) % room.players.length;
        room.gameRound += 1;
        room.incorrectGuesses = 0;

        if (room.gameRound % 2 === 0) {
            room.difficultyLevel += 1;
        }

        io.to(roomCode).emit('challenge_set', {
            msg: `${currentPlayer.nickname} set a new challenge! (Round ${room.gameRound})`,
            room
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const code in rooms) {
            const room = rooms[code];
            const index = room.players.findIndex(p => p.id === socket.id);
            if (index !== -1) {
                room.players.splice(index, 1);
                if (room.players.length === 0) {
                    delete rooms[code];
                } else {
                    if (room.players.length > 0 && room.host === socket.id) {
                        room.host = room.players[0].id;
                    }
                    io.to(code).emit('update_room', room);
                    io.to(code).emit('player_left', { msg: 'A player left the game.' });
                }
                break;
            }
        }
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
