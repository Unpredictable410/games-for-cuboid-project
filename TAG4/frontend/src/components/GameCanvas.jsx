import React, { useRef, useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { PLAYERS_CONFIG } from '../data/players';
import { checkCollision } from '../utils/physics';

const GameCanvas = ({ selectedMap, onGameOver }) => {
  const canvasContainerRef = useRef(null);
  const appRef = useRef(null);
  
  // -- CONSTANTS --
  const SCREEN_W = 800;
  const SCREEN_H = 600;

  // -- 1. ASSET DICTIONARY (All your themes here) --
  const THEME_ASSETS = {
    grass: {
      body: '/assets/terrain_grass_block_center.png',
      top: '/assets/terrain_grass_block_top.png',
      bg: '/assets/bg.png' 
    },
    desert: {
      body: '/assets/terrain_sand_vertical_middle.png',
      top: '/assets/terrain_sand_block_top.png',
      bg: '/assets/bg.png' // Use same BG or add a desert_bg.png
    },
    snow: {
      body: '/assets/terrain_snow_block_bottom.png', 
      top: '/assets/terrain_snow_block_top.png',
      bg: '/assets/bg.png'
    },
    castle: {
      body: '/assets/terrain_stone_vertical_middle.png',
      top: '/assets/terrain_stone_block_top.png',
      bg: '/assets/bg.png'
    }
  };

  // Common items (Water, Bushes, Springs)
  const COMMON_ASSETS = {
    water: '/assets/water.png',
    waterTop: '/assets/water_top.png',
    bush: '/assets/bush.png',
    spring: '/assets/spring.png',       // <--- NEW
    springOut: '/assets/spring_out.png' // <--- NEW
  };

  useEffect(() => {
    let isMounted = true; 
    let tickerFunction = null; 

    if (!selectedMap || !selectedMap.platforms) {
      console.error("❌ CRITICAL ERROR: Map data missing.");
      return;
    }

    const initGame = async () => {
      // A. INIT PIXI
      const app = new PIXI.Application();
      await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#E0F7FA',
        resizeTo: window
      });

      if (!isMounted) { app.destroy(); return; }
      appRef.current = app; 
      if (canvasContainerRef.current) canvasContainerRef.current.appendChild(app.canvas);

      const world = new PIXI.Container();
      app.stage.addChild(world);

      // B. DETERMINE ASSETS TO LOAD
      const theme = selectedMap.theme || 'grass'; // Default to grass
      const themeFiles = THEME_ASSETS[theme];

      // Combine Theme files + Common files
      const assetsToLoad = { 
        ...themeFiles, 
        ...COMMON_ASSETS 
      };

      // C. LOAD ASSETS
      const loadedTextures = {};
      for (const [key, path] of Object.entries(assetsToLoad)) {
        try {
          const texture = await PIXI.Assets.load(path);
          if(isMounted) loadedTextures[key] = texture;
        } catch (e) {
          console.warn(`⚠️ Failed to load ${key}: ${path}`);
        }
      }
      if (!isMounted) return;

      // D. BUILD WORLD

      // 1. Background
      const mapW = selectedMap.width || 2000;
      const mapH = selectedMap.height || 1000;

      if (loadedTextures.bg) {
        const bg = new PIXI.TilingSprite({ texture: loadedTextures.bg, width: mapW, height: mapH });
        world.addChild(bg);
      } else {
        const bg = new PIXI.Graphics().rect(0, 0, mapW, mapH).fill(0xE0F7FA);
        world.addChild(bg);
      }

      // 2. Platforms (Theme Aware)
      selectedMap.platforms.forEach(plat => {
        if (loadedTextures.body && loadedTextures.top) {
            // Body
            const body = new PIXI.TilingSprite({
                texture: loadedTextures.body, 
                width: plat.w, height: plat.h
            });
            body.x = plat.x; body.y = plat.y;
            world.addChild(body);

            // Top
            const top = new PIXI.TilingSprite({
                texture: loadedTextures.top,
                width: plat.w, height: 40 // Assuming tops are 40px tall
            });
            top.x = plat.x; top.y = plat.y;
            world.addChild(top);
        } else {
            // Fallback
            const g = new PIXI.Graphics().rect(plat.x, plat.y, plat.w, plat.h).fill(0x795548);
            world.addChild(g);
        }
      });

      // 3. Springs (Jump Pads)
      const springSprites = []; // Keep track of them for animation
      if (selectedMap.springs && loadedTextures.spring) {
        selectedMap.springs.forEach(s => {
          const spring = new PIXI.Sprite(loadedTextures.spring);
          spring.x = s.x; 
          spring.y = s.y;
          spring.width = 40; 
          spring.height = 40;
          // Store original Y so we don't drift
          spring.baseY = s.y; 
          spring.isCompressed = false;
          
          world.addChild(spring);
          springSprites.push(spring);
        });
      }

      // 4. Water
      if (selectedMap.water) {
        selectedMap.water.forEach(w => {
           if (loadedTextures.water && loadedTextures.waterTop) {
              const body = new PIXI.TilingSprite({ texture: loadedTextures.water, width: w.w, height: w.h });
              body.x = w.x; body.y = w.y + 10;
              world.addChild(body);
              const top = new PIXI.TilingSprite({ texture: loadedTextures.waterTop, width: w.w, height: 40 });
              top.x = w.x; top.y = w.y;
              world.addChild(top);
           } else {
              const g = new PIXI.Graphics().rect(w.x, w.y, w.w, w.h).fill(0x4FC3F7);
              world.addChild(g);
           }
        });
      }

      // 5. Players
      const gameState = {
        players: JSON.parse(JSON.stringify(PLAYERS_CONFIG)).map(p => ({
          ...p, x: p.startPos.x, y: p.startPos.y, vx: 0, vy: 0, w: 40, h: 40, isGrounded: false, cooldown: 0, isIt: false, sprite: null, arrow: null
        })),
        keys: {}, timer: 120, isRunning: true
      };
      gameState.players[Math.floor(Math.random() * 4)].isIt = true;

      gameState.players.forEach(p => {
        const container = new PIXI.Container();
        const g = new PIXI.Graphics().rect(0, 0, p.w, p.h).fill(p.color);
        g.rect(10, 10, 8, 8).fill(0xFFFFFF); g.rect(24, 10, 8, 8).fill(0xFFFFFF);
        container.addChild(g);
        const arrow = new PIXI.Graphics().moveTo(-10, -10).lineTo(10, -10).lineTo(0, 5).fill(0xFF0000);
        arrow.y = -30; arrow.visible = false;
        container.addChild(arrow);
        
        p.sprite = container; p.arrow = arrow;
        world.addChild(container);
      });

      // HUD
      const style = new PIXI.TextStyle({ fontFamily: 'monospace', fontSize: 30, fill: '#333', fontWeight: 'bold' });
      const timeText = new PIXI.Text({ text: 'Time: 120', style });
      timeText.x = 20; timeText.y = 20;
      app.stage.addChild(timeText);

      // E. GAME LOOP
      tickerFunction = (ticker) => {
        if (!gameState.isRunning) return;
        const delta = ticker.deltaTime;

        gameState.timer -= (1/60) * delta;
        timeText.text = `Time: ${Math.ceil(gameState.timer)}`;
        if (gameState.timer <= 0) { gameState.isRunning = false; onGameOver(gameState.players); return; }

        const GRAVITY = 0.6 * delta;
        const SPEED = 5 * delta;

        gameState.players.forEach(p => {
           if(p.cooldown > 0) p.cooldown -= delta;
           p.vy += GRAVITY;
           if(gameState.keys[p.keys.left]) p.vx = -SPEED;
           else if(gameState.keys[p.keys.right]) p.vx = SPEED;
           else p.vx *= 0.8;

           if(gameState.keys[p.keys.up] && p.isGrounded) { p.vy = -14; p.isGrounded = false; }
           p.isGrounded = false;

           // 1. Platform Collisions
           let nextY = p.y + p.vy;
           let hitY = false;
           selectedMap.platforms.forEach(plat => {
              if(checkCollision({x:p.x, y:nextY, w:p.w, h:p.h}, plat)) {
                 hitY = true;
                 if(p.vy > 0) { p.y = plat.y - p.h; p.vy = 0; p.isGrounded = true; }
                 else if(p.vy < 0) { p.y = plat.y + plat.h; p.vy = 0; }
              }
           });
           if(!hitY) p.y = nextY;

           let nextX = p.x + p.vx;
           let hitX = false;
           selectedMap.platforms.forEach(plat => {
              if(checkCollision({x:nextX, y:p.y, w:p.w, h:p.h}, plat)) { hitX = true; p.vx = 0; }
           });
           
           if(nextX < 0) nextX = 0; if(nextX > mapW - p.w) nextX = mapW - p.w;
           if(!hitX) p.x = nextX;

           // 2. SPRING COLLISIONS (NEW)
           springSprites.forEach(spring => {
              // Simple AABB Collision
              if (
                 p.x < spring.x + spring.width &&
                 p.x + p.w > spring.x &&
                 p.y + p.h > spring.y &&
                 p.y < spring.y + spring.height
              ) {
                 // Check if falling DOWN onto spring
                 if (p.vy > 0) {
                    p.vy = -22; // SUPER JUMP! (Normal is -14)
                    p.isGrounded = false;
                    
                    // Animation: Swap texture to "Out"
                    if (loadedTextures.springOut) {
                        spring.texture = loadedTextures.springOut;
                        // Reset texture after 500ms
                        setTimeout(() => { 
                             if(spring && loadedTextures.spring) spring.texture = loadedTextures.spring; 
                        }, 200);
                    }
                 }
              }
           });

           // Water
           if(p.y > mapH) { p.x=20; p.y=0; p.vy=0; }
           if(selectedMap.water) selectedMap.water.forEach(w => {
              if(checkCollision({x:p.x, y:p.y, w:p.w, h:p.h}, w)) { p.x=20; p.y=0; p.vy=0; }
           });

           if(p.sprite) {
             p.sprite.x = p.x; p.sprite.y = p.y;
             p.arrow.visible = p.isIt;
             if(p.isIt) p.arrow.y = -30 + Math.sin(Date.now()/200)*5;
           }
        });

        // Tag Logic
        for(let i=0; i<gameState.players.length; i++) {
           for(let j=i+1; j<gameState.players.length; j++) {
              let p1 = gameState.players[i]; let p2 = gameState.players[j];
              if(checkCollision({x:p1.x,y:p1.y,w:p1.w,h:p1.h}, {x:p2.x,y:p2.y,w:p2.w,h:p2.h})) {
                 if(p1.isIt && !p2.isIt && p1.cooldown<=0) { p1.isIt=false; p2.isIt=true; p1.cooldown=60; p2.cooldown=60;}
                 else if(p2.isIt && !p1.isIt && p2.cooldown<=0) { p2.isIt=false; p1.isIt=true; p2.cooldown=60; p1.cooldown=60;}
              }
           }
        }

        // Camera
        let avgX = 0, avgY = 0;
        gameState.players.forEach(p => { avgX += p.x; avgY += p.y; });
        avgX /= gameState.players.length; avgY /= gameState.players.length;
        
        let targetX = -avgX + app.screen.width/2;
        let targetY = -avgY + app.screen.height/2;
        
        targetX = Math.min(0, Math.max(targetX, -(mapW - app.screen.width)));
        targetY = Math.min(0, Math.max(targetY, -(mapH - app.screen.height)));
        
        world.x = targetX; world.y = targetY;
      };

      app.ticker.add(tickerFunction);
      const handleDown = (e) => { gameState.keys[e.key] = true; };
      const handleUp = (e) => { gameState.keys[e.key] = false; };
      window.addEventListener('keydown', handleDown);
      window.addEventListener('keyup', handleUp);
    };

    initGame();

    return () => {
      isMounted = false; 
      if (appRef.current) {
        appRef.current.ticker.stop();
        if (tickerFunction) appRef.current.ticker.remove(tickerFunction);
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
  }, [selectedMap, onGameOver]);

  return (
    <div 
      ref={canvasContainerRef} 
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', background: '#000'}} 
    />
  );
};

export default GameCanvas;