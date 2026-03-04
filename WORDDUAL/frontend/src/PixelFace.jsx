import React, { useState, useEffect } from "react";

const PixelFace = ({ skinColor, lives, isHit, isDead, isTurn, isSafe, accessory }) => {
    const [pupilX, setPupilX] = useState(0);
    
    useEffect(() => {
      if (isDead || isHit) { setPupilX(0); return; }
      const interval = setInterval(() => {
         const r = Math.random();
         if (r > 0.7) setPupilX(-5);      
         else if (r < 0.3) setPupilX(5);  
         else setPupilX(0);               
      }, 1200);
      return () => clearInterval(interval);
    }, [isDead, isHit]);
  
    // --- VISUAL LOGIC ---
    let eyeHeight = "12px";
    let mouthHeight = "4px"; 
    let mouthWidth = "30px";
    let mouthRadius = "0px"; 
    let faceColor = skinColor;
    let shake = "none";
    let overlay = "none";
  
    if (isDead) {
        eyeHeight = "4px"; mouthHeight = "2px"; mouthRadius = "0px"; faceColor = "#555";
    } else if (isHit) {
        eyeHeight = "10px"; mouthHeight = "12px"; mouthWidth = "12px"; mouthRadius = "50%";
        shake = "translate(2px, 2px)"; overlay = "rgba(255,0,0,0.5)"; 
    } else if (lives === 2) {
        overlay = "rgba(100, 50, 0, 0.2)";
    } else if (lives === 1) {
        mouthHeight = "6px"; mouthRadius = "4px 4px 0 0";
        shake = `rotate(${Math.sin(Date.now() / 50) * 2}deg)`; overlay = "rgba(255, 0, 0, 0.3)"; 
    }
  
    if (isSafe) { overlay = "rgba(0, 255, 0, 0.3)"; }
  
    return (
      <div className="face-container" style={{ transform: shake }}>
          <div className="damage-overlay" style={{ background: overlay }}></div>
          
          <div className="head" style={{ background: faceColor }}>
              <div className="hair"></div>
              
              <div className="eyes-row">
                  <div className="eye-socket">
                      <div className="eye-white" style={{ height: eyeHeight }}>
                          {!isDead && <div className="pupil" style={{ transform: `translateX(${pupilX}px)` }}></div>}
                      </div>
                  </div>
                  <div className="eye-socket">
                      <div className="eye-white" style={{ height: eyeHeight }}>
                          {!isDead && <div className="pupil" style={{ transform: `translateX(${pupilX}px)` }}></div>}
                      </div>
                  </div>
              </div>

              {/* --- ACCESSORIES --- */}
              {accessory === "shades" && (
                  <div className="acc-shades"><div className="lens"></div><div className="bridge"></div><div className="lens"></div></div>
              )}
              {accessory === "goggles" && (
                  <div className="acc-goggles">
                      <div className="strap"></div><div className="lens-frame"><div className="lens-glass"></div></div>
                      <div className="bridge"></div><div className="lens-frame"><div className="lens-glass"></div></div>
                  </div>
              )}
              {accessory === "band" && <div className="acc-band"><div className="knot"></div></div>}
              {accessory === "cap" && <div className="acc-cap"><div className="visor"></div></div>}
              {accessory === "eyepatch" && <div className="acc-eyepatch"><div className="patch"></div><div className="string"></div></div>}
              {accessory === "mask" && <div className="acc-mask"></div>}
              {accessory === "crown" && <div className="acc-crown"><div className="jewel"></div></div>}
              {accessory === "vr" && <div className="acc-vr"><div className="light"></div></div>}

              <div className="nose"></div>
              <div className="mouth" style={{ width: mouthWidth, height: mouthHeight, borderRadius: mouthRadius }}></div>
          </div>

          <style>{`
              .face-container { width: 100%; height: 100%; position: relative; overflow: hidden; background: #222; }
              .damage-overlay { position: absolute; inset: 0; z-index: 10; pointer-events: none; transition: background 0.1s; }
              .head { width: 70%; height: 70%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 4px 4px 0 rgba(0,0,0,0.2); display: flex; flex-direction: column; align-items: center; transition: background 0.3s; }
              .hair { width: 104%; height: 20%; background: #111; margin-top: -2%; margin-bottom: 10px; }
              .eyes-row { display: flex; gap: 15px; margin-bottom: 10px; width: 100%; justify-content: center; position: relative; z-index: 2; }
              .eye-socket { width: 24px; height: 16px; background: rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; }
              .eye-white { width: 16px; background: #fff; position: relative; transition: height 0.1s; }
              .pupil { width: 6px; height: 6px; background: #000; position: absolute; top: 50%; left: 50%; margin-top: -3px; margin-left: -3px; transition: transform 0.2s; }
              .nose { width: 8px; height: 12px; background: rgba(0,0,0,0.2); margin-bottom: 8px; }
              .mouth { background: #5a2e2e; transition: all 0.1s; }

              /* ACCESSORIES */
              .acc-shades { position: absolute; top: 28px; width: 100%; display: flex; justify-content: center; align-items: center; z-index: 6; }
              .acc-shades .lens { width: 28px; height: 16px; background: #000; border: 1px solid #333; }
              .acc-shades .bridge { width: 8px; height: 4px; background: #000; margin-top: -8px; }

              .acc-goggles { position: absolute; top: 22px; width: 100%; display: flex; justify-content: center; align-items: center; z-index: 6; }
              .acc-goggles .strap { position: absolute; width: 104%; height: 6px; background: #444; z-index: -1; top: 8px; }
              .acc-goggles .lens-frame { width: 32px; height: 22px; background: #555; border-radius: 4px; display: flex; align-items: center; justify-content: center; border: 2px solid #222; }
              .acc-goggles .lens-glass { width: 22px; height: 12px; background: rgba(50, 255, 255, 0.5); box-shadow: inset 0 0 4px rgba(255,255,255,0.8); }
              .acc-goggles .bridge { width: 4px; height: 4px; background: #333; }

              .acc-band { position: absolute; top: 15px; width: 104%; height: 12px; background: #ef4444; z-index: 6; box-shadow: 0 2px 0 rgba(0,0,0,0.2); }
              .acc-band .knot { position: absolute; right: -8px; top: 4px; width: 10px; height: 20px; background: #ef4444; transform: rotate(20deg); border: 1px solid #991b1b; }

              .acc-cap { position: absolute; top: 0; width: 104%; height: 25px; background: #3b82f6; z-index: 6; }
              .acc-cap .visor { width: 120%; height: 8px; background: #1d4ed8; position: absolute; bottom: 0; left: -10%; border-bottom: 2px solid #1e3a8a; }

              .acc-eyepatch { position: absolute; top: 26px; width: 100%; z-index: 7; }
              .acc-eyepatch .patch { position: absolute; left: 28px; width: 26px; height: 20px; background: #000; border-radius: 40%; border: 2px solid #333; }
              .acc-eyepatch .string { position: absolute; top: 0; width: 100%; height: 2px; background: #000; transform: rotate(-15deg); }

              .acc-mask { position: absolute; bottom: 0; width: 60%; height: 35px; background: #fff; z-index: 5; border: 2px solid #ccc; border-radius: 5px 5px 0 0; }

              .acc-crown { position: absolute; top: -15px; width: 100%; height: 20px; background: #eab308; z-index: 7; clip-path: polygon(0% 100%, 20% 0%, 40% 100%, 60% 0%, 80% 100%, 100% 0%, 100% 100%); }
              
              .acc-vr { position: absolute; top: 25px; width: 80%; height: 25px; background: #333; z-index: 7; border: 2px solid #000; }
              .acc-vr .light { width: 4px; height: 4px; background: #0f0; position: absolute; right: 5px; top: 5px; box-shadow: 0 0 5px #0f0; }
          `}</style>
      </div>
    );
};

export default PixelFace;