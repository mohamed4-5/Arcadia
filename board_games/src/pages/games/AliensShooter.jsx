import { useEffect, useRef, useState } from "react";
import PageWrapper from "../../PageWrapper";


const WIDTH = 340;
const HEIGHT = 500;
const PLAYER_W = 40;
const PLAYER_H = 40;
const PLAYER_SPEED = 6;
const ENEMY_SIZE = 40;
const INITIAL_MAX_ENEMIES = 3;
const BULLET_SIZE = 6;
const PLAYER_BULLET_SPEED = 10;
const FIRE_COOLDOWN = 300;
const MAX_AMMO = 8;
const RELOAD_TIME = 1200;
const HEART_DROP_TIME = 20000;
const BASE_ENEMY_SPEED = 3;
const MAX_ENEMY_SPEED = 4;
const BASE_ENEMY_FIRE_RATE = 900;
const MIN_ENEMY_FIRE_RATE = 400;

export default function AliensShooter() {
  const animationRef = useRef(null);
  const lastFireRef = useRef(0);
  const lastEnemyShotRef = useRef(0);
  const lastHeartRef = useRef(0);
  const reloadIntervalRef = useRef(null);

  const [ammo, setAmmo] = useState(MAX_AMMO);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadProgress, setReloadProgress] = useState(100);
  const [gameStatus, setGameStatus] = useState("playing");

  const keys = useRef({});
  const state = useRef({
    playerX: WIDTH / 2 - PLAYER_W / 2,
    bullets: [],
    enemyBullets: [],
    enemies: [],
    hearts: [],
    lives: 3,
    score: 0,
    gameOver: false,
  });

  const [renderState, setRenderState] = useState({ ...state.current });

  useEffect(() => {
    const down = (e) => (keys.current[e.key] = true);
    const up = (e) => (keys.current[e.key] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

    const handleTouchStart = (key) => (keys.current[key] = true);
  const handleTouchEnd = (key) => (keys.current[key] = false);

  const triggerReload = () => {
    if (isReloading) return;
    setIsReloading(true);
    setReloadProgress(0);
    
    let progress = 0;
    const step = 100 / (RELOAD_TIME / 50);
    
    if (reloadIntervalRef.current) clearInterval(reloadIntervalRef.current);
    
    reloadIntervalRef.current = setInterval(() => {
      progress += step;
      setReloadProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearInterval(reloadIntervalRef.current);
        setAmmo(MAX_AMMO);
        setIsReloading(false);
      }
    }, 50);
  };

  const startGameLoop = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const update = (time) => {
      const s = state.current;
      if (s.gameOver) {
        setGameStatus("lose");
        return;
      }

      const difficulty = Math.min(s.score / 50, 1);
      const maxEnemies = INITIAL_MAX_ENEMIES + Math.floor(s.score / 10);
      const enemySpeed = BASE_ENEMY_SPEED + (MAX_ENEMY_SPEED - BASE_ENEMY_SPEED) * difficulty;
      const enemyFireRate = BASE_ENEMY_FIRE_RATE - (BASE_ENEMY_FIRE_RATE - MIN_ENEMY_FIRE_RATE) * difficulty;

      // PLAYER MOVE
      if (keys.current["ArrowLeft"]) s.playerX = Math.max(0, s.playerX - PLAYER_SPEED);
      if (keys.current["ArrowRight"]) s.playerX = Math.min(WIDTH - PLAYER_W, s.playerX + PLAYER_SPEED);

      // PLAYER FIRE
      if (keys.current[" "] && !isReloading && time - lastFireRef.current > FIRE_COOLDOWN) {
        setAmmo(prev => {
          if (prev > 0) {
            s.bullets.push({ x: s.playerX + PLAYER_W / 2 - BULLET_SIZE / 2, y: HEIGHT - PLAYER_H - 10 });
            lastFireRef.current = time;
            const newAmmo = prev - 1;
            setReloadProgress((newAmmo / MAX_AMMO) * 100);
            if (newAmmo === 0) triggerReload();
            return newAmmo;
          }
          return prev;
        });
      }

      // SPAWN ENEMIES
      if (s.enemies.length < maxEnemies && Math.random() < 0.03) {
        const hard = Math.random() < 0.4 + difficulty * 0.4;
        s.enemies.push({ x: Math.random() * (WIDTH - ENEMY_SIZE), y: -ENEMY_SIZE, hp: hard ? 2 : 1, hard, dir: Math.random() > 0.5 ? 1 : -1 });
      }

      // MOVE ENEMIES
      s.enemies.forEach(e => {
        if (e.y < 30) e.y += 2;
        e.x += e.dir * enemySpeed;
        if (e.x <= 0 || e.x >= WIDTH - ENEMY_SIZE) { e.dir *= -1; e.y += 20; }
        if (e.y + ENEMY_SIZE >= HEIGHT - PLAYER_H - 10) { s.gameOver = true; s.lives = 0; }
        if (e.hard && e.hp === 1) e.hard = false;
      });

      // ENEMY FIRE
      if (time - lastEnemyShotRef.current > enemyFireRate && s.enemies.length) {
        const shooter = s.enemies[Math.floor(Math.random() * s.enemies.length)];
        s.enemyBullets.push({ x: shooter.x + ENEMY_SIZE / 2, y: shooter.y + ENEMY_SIZE, speed: 4 + difficulty * 5 });
        lastEnemyShotRef.current = time;
      }

      // MOVE BULLETS
      s.bullets.forEach(b => (b.y -= PLAYER_BULLET_SPEED));
      s.enemyBullets.forEach(b => (b.y += b.speed));

      // BULLET VS ENEMY
      s.enemies = s.enemies.filter(e => {
        const hit = s.bullets.find(b => b.x > e.x && b.x < e.x + ENEMY_SIZE && b.y > e.y && b.y < e.y + ENEMY_SIZE);
        if (hit) {
          s.bullets = s.bullets.filter(b => b !== hit);
          e.hp -= 1;
          if (e.hp <= 0) { s.score += 1; return false; }
        }
        return true;
      });

      // ENEMY BULLET HIT PLAYER
      s.enemyBullets = s.enemyBullets.filter((b) => {
        const hit = b.y > HEIGHT - PLAYER_H - 20 && b.x > s.playerX && b.x < s.playerX + PLAYER_W;
        if (hit) { s.lives -= 1; if (s.lives <= 0) s.gameOver = true; return false; }
        return b.y < HEIGHT;
      });

      // HEARTS
      if (time - lastHeartRef.current > HEART_DROP_TIME && s.lives < 3) {
        s.hearts.push({ x: Math.random() * (WIDTH - 20), y: 0 });
        lastHeartRef.current = time;
      }
      s.hearts.forEach(h => h.y += 2);
      s.hearts = s.hearts.filter(h => {
        const hit = h.y + 20 > HEIGHT - PLAYER_H - 10 && h.x + 20 > s.playerX && h.x < s.playerX + PLAYER_W;
        if (hit) { if (s.lives < 3) s.lives += 1; return false; }
        return h.y < HEIGHT;
      });

      setRenderState({ ...s });
      animationRef.current = requestAnimationFrame(update);
    };
    animationRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    startGameLoop();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const reset = () => {
    // 1. تصفير الـ Interval
    if (reloadIntervalRef.current) clearInterval(reloadIntervalRef.current);
    
    // 2. تصفير الحالات (States)
    setAmmo(MAX_AMMO);
    setIsReloading(false);
    setReloadProgress(100);
    setGameStatus("playing");
    
    // 3. تصفير المراجع (Refs)
    state.current = { 
      playerX: WIDTH / 2 - PLAYER_W / 2, 
      bullets: [], 
      enemyBullets: [], 
      enemies: [], 
      hearts: [], 
      lives: 3, 
      score: 0, 
      gameOver: false 
    };
    
    // 4. إعادة تشغيل اللوب
    setRenderState({ ...state.current });
    startGameLoop();
  };

  return (
    <PageWrapper>
      
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white p-4 select-none font-sans">
        <h1 className="text-4xl font-black mb-4 tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">Aliens Shooter</h1>
        
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="flex items-center gap-6 text-xl font-mono">
             {/* SCORE (عرض ثابت) */}
              <div className="w-[120px] text-left text-2xl text-pink-400">
                Score: {renderState.score}
              </div>

              {/* HEARTS */}
              <div className="flex gap-1 text-red-500 text-2xl">
              {[0, 1, 2].map((i) => (
                <span
                key={i}
                className={`transition-all duration-300 ${
                  i < renderState.lives ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
              >
                ❤
              </span>
              ))}
            </div>

          </div>

          <div className="w-[200px] h-3 bg-white/10 rounded-full border border-white/20 overflow-hidden">
            <div 
              className={`h-full transition-all duration-75 ${isReloading ? 'bg-yellow-500 animate-pulse' : 'bg-cyan-400'}`} 
              style={{ width: `${reloadProgress}% `}} 
            />
          </div>
          <span className="text-xs font-bold text-cyan-200">{isReloading ? "RELOADING..." : `AMMO: ${ammo}/${MAX_AMMO}`}</span>
        </div>

        <div className="relative bg-black/60 border-2 border-cyan-400/20 rounded-xl overflow-hidden shadow-2xl" style={{ width: WIDTH, height: HEIGHT }}>
          {/* PLAYER */}
          <div className="absolute bg-pink-500 rounded-t-lg shadow-[0_0_15px_#ec4899]" style={{ width: PLAYER_W, height: PLAYER_H, left: renderState.playerX, bottom: 10 }} />

          {/* ENEMIES */}
          {renderState.enemies.map((e, i) => (
            <div key={i} className={`absolute rounded-lg shadow-lg ${e.hard ? "bg-red-600 shadow-red-900/50" : "bg-green-500 shadow-green-900/50"}`} style={{ width: ENEMY_SIZE, height: ENEMY_SIZE, left: e.x, top: e.y }} />
          ))}

          {/* BULLETS */}
          {renderState.bullets.map((b, i) => (
            <div key={i} className="absolute bg-yellow-400 rounded-full" style={{ width: BULLET_SIZE, height: 15, left: b.x, top: b.y }} />
          ))}

          {/* ENEMY BULLETS */}
          {renderState.enemyBullets.map((b, i) => (
            <div key={i} className="absolute bg-red-400 rounded-full" style={{ width: BULLET_SIZE, height: 12, left: b.x, top: b.y }} />
          ))}

          {/* HEARTS */}
          {renderState.hearts.map((h, i) => (
            <div key={i} className="absolute text-2xl animate-bounce" style={{ left: h.x, top: h.y }}>❤</div>
          ))}

          {renderState.gameOver && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-6 z-50 backdrop-blur-sm animate-in fade-in duration-300">
              <h2 className="text-5xl font-black text-white italic drop-shadow-[0_4px_0_rgba(0,0,0,1)]">GAME OVER!</h2>
              <div className="text-xl font-mono text-cyan-400 font-bold bg-slate-800/50 px-4 py-2 rounded-lg">
                SCORE: {renderState.score}
              </div>
              <button onClick={reset} className="px-10 py-4 cursor-pointer bg-yellow-400 text-black font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                TRY AGAIN
              </button>
            </div>
          )}
        </div>
                {/* MOBILE CONTROLS */}
        <div className="flex gap-4 mt-8 w-full max-w-[340px] h-20 md:hidden">
          <button onPointerDown={() => handleTouchStart("ArrowLeft")} onPointerUp={() => handleTouchEnd("ArrowLeft")} className="flex-1 bg-white/10 rounded-xl text-3xl active:bg-white/30 touch-none">⬅</button>
          <button onPointerDown={() => handleTouchStart("ArrowRight")} onPointerUp={() => handleTouchEnd("ArrowRight")} className="flex-1 bg-white/10 rounded-xl text-3xl active:bg-white/30 touch-none">➡</button>
          <button onPointerDown={() => handleTouchStart(" ")} onPointerUp={() => handleTouchEnd(" ")} className="flex-[1.5] bg-red-500/50 rounded-xl text-3xl active:bg-red-500/80 border-2 border-red-500/20 touch-none">🔥</button>
        </div>

      </div>
    </PageWrapper>
  );
}