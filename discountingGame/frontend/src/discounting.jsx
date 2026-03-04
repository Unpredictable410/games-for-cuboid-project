import { useState, useEffect } from 'react'

const styles = `
:root {
  --bg-dark: #1a1a2e;
  --primary: #0f3460;
  --accent: #e94560;
  --text: #ffffff;
  --card-bg: #16213e;
  --success: #4cc9f0;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
}

body {
  margin: 0;
  padding: 0;
  min-width: 320px;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-dark);
  color: var(--text);
  overflow: hidden; /* Prevent scrolling */
}

.game-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #16213e 0%, #1a1a2e 100%);
  position: relative;
}

.menu-screen {
  text-align: center;
  animation: fadeIn 0.5s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

h1 {
  font-size: 2.5rem;
  margin: 0 0 20px 0;
  background: linear-gradient(45deg, #4cc9f0, #4361ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  color: #a0a0a0;
  margin-bottom: 40px;
  max-width: 300px;
  line-height: 1.5;
}

.level-reached {
  color: #e94560;
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: -10px;
  margin-bottom: 20px;
}

.btn-primary {
  background: linear-gradient(45deg, #4361ee, #3a0ca3);
  border: none;
  padding: 15px 40px;
  border-radius: 50px;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 10px 20px rgba(67, 97, 238, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(67, 97, 238, 0.4);
}

.btn-primary:active {
  transform: translateY(1px);
}

.hud {
  position: absolute;
  top: 20px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  font-weight: bold;
  font-size: 1.1rem;
}

.stat span {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.instructions {
  margin-top: 60px;
  margin-bottom: 20px;
  font-size: 1.2rem;
  color: #4cc9f0;
}

.cards-area {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  max-width: 800px;
  padding: 20px;
}

.card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  width: 120px; /* Base size */
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s, opacity 0.3s;
  user-select: none;
}

.card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.card:active {
  transform: scale(0.95);
}

.card.solved {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.8);
}

.tag-hole {
  width: 12px;
  height: 12px;
  background-color: var(--bg-dark);
  border-radius: 50%;
  position: absolute;
  top: 15px;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 20px;
}

.discount-badge {
  background: var(--accent);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  margin-top: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
}

@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px) rotate(-5deg); filter: hue-rotate(-50deg); }
  50% { transform: translateX(5px) rotate(5deg); }
  75% { transform: translateX(-5px) rotate(-5deg); }
  100% { transform: translateX(0); }
}

.card.shake {
  animation: shake 0.4s ease-in-out;
  border-color: red;
}

.card.correct {
  border-color: #2ecc71;
  box-shadow: 0 0 20px #2ecc71, inset 0 0 10px rgba(46, 204, 113, 0.3);
  transform: scale(1.05);
  background: rgba(46, 204, 113, 0.1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Results Table */
.results-table-container {
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  max-width: 90%;
  overflow-x: auto;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  color: #fff;
}

.results-table th {
  text-align: left;
  padding: 10px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  color: #4cc9f0;
}

.results-table td {
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.results-table tr:last-child td {
  border-bottom: none;
}

.final-price-col {
  color: #e94560;
  font-weight: bold;
}
`;

function Discounting() {
    const [gameState, setGameState] = useState('menu'); // menu, playing, won, lost
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [items, setItems] = useState([]);
    const [shakingId, setShakingId] = useState(null);
    const [correctId, setCorrectId] = useState(null);

    // Constants
    const MAX_LEVEL = 6;
    const DISCOUNTS = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];

    const startGame = () => {
        setGameState('playing');
        setLevel(1);
        setScore(0);
        setLives(3);
        generateLevel(1);
    };

    const generateLevel = (lvl) => {
        // Level 1 has 2 items, Level 2 has 3 items, etc.
        const numItems = lvl + 1;
        const newItems = [];

        for (let i = 0; i < numItems; i++) {
            let price, discount, finalPrice;
            // Ensure unique final prices to avoid ambiguity
            let isUnique = false;
            while (!isUnique) {
                price = Math.floor(Math.random() * 90) + 10; // 10 to 99
                // Make prices usually round numbers for easier math, but vary it
                if (Math.random() > 0.3) price = Math.ceil(price / 5) * 5;

                discount = DISCOUNTS[Math.floor(Math.random() * DISCOUNTS.length)];
                finalPrice = price * (1 - discount / 100);

                // checks collision with existing items
                isUnique = !newItems.some(item => Math.abs(item.finalPrice - finalPrice) < 0.1);
            }

            newItems.push({
                id: i,
                originalPrice: price,
                discount: discount,
                finalPrice: finalPrice,
                solved: false
            });
        }
        setItems(newItems);
    };

    const handleCardClick = (id) => {
        if (gameState !== 'playing' || shakingId || correctId) return;

        const clickedItem = items.find(i => i.id === id);
        if (clickedItem.solved) return;

        // Find the unsolved item with the lowest final price
        const activeItems = items.filter(i => !i.solved);
        activeItems.sort((a, b) => a.finalPrice - b.finalPrice);

        const correctItem = activeItems[0];

        if (clickedItem.id === correctItem.id) {
            // Correct click
            setCorrectId(id);

            setTimeout(() => {
                const newItems = items.map(item =>
                    item.id === id ? { ...item, solved: true } : item
                );
                setItems(newItems);
                setScore(prev => prev + 10 * level);
                setCorrectId(null);

                // Check if level complete
                if (newItems.every(i => i.solved)) {
                    if (level < MAX_LEVEL) {
                        setTimeout(() => {
                            setLevel(prev => prev + 1);
                            generateLevel(level + 1);
                        }, 1000);
                    } else {
                        setGameState('won');
                    }
                }
            }, 500); // Wait for animation
        } else {
            // Wrong click
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) setGameState('lost');
                return newLives;
            });

            // Shake animation
            setShakingId(id);
            setTimeout(() => setShakingId(null), 500);
        }
    };

    return (
        <>
            <style>{styles}</style>
            <div className="game-container">
                {gameState === 'menu' && (
                    <div className="menu-screen">
                        <div className="icon">🏷️</div>
                        <h1>Discounting</h1>
                        <p>Tap items from <strong>lowest</strong> to <strong>highest</strong> discounted price.</p>
                        <button className="btn-primary" onClick={startGame}>Play</button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <>
                        <div className="hud">
                            <div className="stat"><span>Level</span> {level}/{MAX_LEVEL}</div>
                            <div className="stat"><span>Score</span> {score}</div>
                            <div className="stat"><span>Lives</span> {'❤️'.repeat(lives)}</div>
                        </div>

                        <div className="instructions">
                            Tap the lowest price!
                        </div>

                        <div className="cards-area">
                            {items.map(item => (
                                <div
                                    key={item.id}
                                    className={`card ${item.solved ? 'solved' : ''} ${shakingId === item.id ? 'shake' : ''} ${correctId === item.id ? 'correct' : ''}`}
                                    onClick={() => handleCardClick(item.id)}
                                >
                                    <div className="tag-hole"></div>
                                    <div className="price">${item.originalPrice}</div>
                                    <div className="discount-badge">{item.discount}% OFF</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {gameState === 'lost' && (
                    <div className="menu-screen">
                        <h1>Game Over</h1>
                        <p className="level-reached">Failed at Level {level}</p>
                        <p>Final Score: {score}</p>

                        <div className="results-table-container">
                            <h3>Solution</h3>
                            <table className="results-table">
                                <thead>
                                    <tr>
                                        <th>Price</th>
                                        <th>Discount</th>
                                        <th>Final</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...items].sort((a, b) => a.finalPrice - b.finalPrice).map(item => (
                                        <tr key={item.id}>
                                            <td>${item.originalPrice}</td>
                                            <td>{item.discount}%</td>
                                            <td className="final-price-col">${item.finalPrice.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button className="btn-primary" onClick={startGame}>Try Again</button>
                    </div>
                )}

                {gameState === 'won' && (
                    <div className="menu-screen">
                        <h1>You Won! 🎉</h1>
                        <p>Final Score: {score}</p>

                        <div className="results-table-container">
                            <h3>Final Round Results</h3>
                            <table className="results-table">
                                <thead>
                                    <tr>
                                        <th>Price</th>
                                        <th>Discount</th>
                                        <th>Final</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...items].sort((a, b) => a.finalPrice - b.finalPrice).map(item => (
                                        <tr key={item.id}>
                                            <td>${item.originalPrice}</td>
                                            <td>{item.discount}%</td>
                                            <td className="final-price-col">${item.finalPrice.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button className="btn-primary" onClick={startGame}>Play Again</button>
                    </div>
                )}
            </div>
        </>
    )
}

export default Discounting
