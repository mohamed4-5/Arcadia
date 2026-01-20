import { useEffect, useState, useRef } from "react";
import PageWrapper from "../../PageWrapper";

export default function Shooter() {
  const PLAYER_X = 260;

  const [direction, setDirection] = useState("right");
  const [shots, setShots] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [lives, setLives] = useState(3);

  const [score, setScore] = useState(0);
  const [enemySpeed, setEnemySpeed] = useState(2); // 👈 أقل شوية
  const [spawnRate, setSpawnRate] = useState(1000);

  const [level, setLevel] = useState(0);
  const [canShoot, setCanShoot] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState("playing");

  const shotsRef = useRef([]);
  const enemiesRef = useRef([]);

  /* ================= SYNC REFS ================= */
  useEffect(() => {
    shotsRef.current = shots;
  }, [shots]);

  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

  /* ================= 🔫 SHOOT ================= */
  const shoot = () => {
    if (!canShoot || isGameOver) return;

    setCanShoot(false);

    setShots((prev) => [
      ...prev,
      {
        id: Date.now(),
        x: PLAYER_X,
        dir: direction,
        hit: false,
      },
    ]);

    // 👇 cooldown أقل
    setTimeout(() => setCanShoot(true), 150);
  };

  /* ================= 🎹 CONTROLS ================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) return;

      if (e.key === "ArrowLeft") setDirection("left");
      if (e.key === "ArrowRight") setDirection("right");
      if (e.key === " ") shoot();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, canShoot, isGameOver]);

  /* ================= 👾 SPAWN ================= */
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      const side = Math.random() > 0.5 ? "left" : "right";
      const hard = Math.random() < 0.35;

      setEnemies((prev) => [
        ...prev,
        {
          id: Date.now(),
          side,
          x: side === "left" ? 0 : 480,
          hp: hard ? 2 : 1,
        },
      ]);
    }, spawnRate);

    return () => clearInterval(interval);
  }, [spawnRate, isGameOver]);

  /* ================= 🎮 GAME LOOP (60 FPS) ================= */
  useEffect(() => {
    if (isGameOver) return;

    let animationId;

    const loop = () => {
      // MOVE ENEMIES
      setEnemies((prev) =>
        prev.map((e) => ({
          ...e,
          x: e.side === "left" ? e.x + enemySpeed : e.x - enemySpeed,
        }))
      );

      // MOVE SHOTS
      setShots((prev) =>
        prev
          .map((s) => ({
            ...s,
            x: s.dir === "right" ? s.x + 12 : s.x - 12,
          }))
          .filter((s) => {
            const out = s.x <= 0 || s.x >= 520;

            if (out && !s.hit) {
              setLives((l) => {
                if (l - 1 <= 0) {
                  setIsGameOver(true);
                  setGameStatus("lose");
                  return 0;
                }
                return l - 1;
              });
            }

            return !out;
          })
      );

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [enemySpeed, isGameOver]);

  /* ================= 🎯 COLLISION ================= */
  useEffect(() => {
    if (isGameOver) return;

    const hits = [];

    shots.forEach((shot) => {
      const enemy = enemies.find((e) => Math.abs(shot.x - e.x) < 15);
      if (enemy) hits.push({ shotId: shot.id, enemyId: enemy.id });
    });

    if (!hits.length) return;

    setShots((prev) =>
      prev.map((s) =>
        hits.find((h) => h.shotId === s.id) ? { ...s, hit: true } : s
      )
    );

    setEnemies((prev) =>
      prev
        .map((enemy) => {
          const hit = hits.find((h) => h.enemyId === enemy.id);
          if (!hit) return enemy;

          const hp = enemy.hp - 1;
          if (hp <= 0) setScore((s) => s + 10);
          return { ...enemy, hp };
        })
        .filter((e) => e.hp > 0)
    );

    setShots((prev) =>
      prev.filter((s) => !hits.find((h) => h.shotId === s.id))
    );
  }, [shots, enemies, isGameOver]);

  /* ================= ❤ PLAYER HIT ================= */
  useEffect(() => {
    if (isGameOver) return;

    enemies.forEach((enemy) => {
      if (Math.abs(enemy.x - PLAYER_X) < 15) {
        setEnemies((prev) => prev.filter((e) => e.id !== enemy.id));
        setLives((l) => {
          if (l - 1 <= 0) {
            setIsGameOver(true);
            setGameStatus("lose");
            return 0;
          }
          return l - 1;
        });
      }
    });
  }, [enemies]);

  /* ================= 🔥 DIFFICULTY (LIMITED) ================= */
  useEffect(() => {
    const newLevel = Math.floor(score / 30);
    if (newLevel > level) {
      setLevel(newLevel);

      setEnemySpeed((s) => Math.min(s + 0.5, 3)); // 👈 حد أقصى
      setSpawnRate((r) => Math.max(r - 150, 600)); // 👈 حد أقصى
    }
  }, [score]);

  /* ================= 🔄 RESET ================= */
  const resetGame = () => {
    setDirection("right");
    setShots([]);
    setEnemies([]);
    setLives(3);
    setScore(0);
    setEnemySpeed(2);
    setSpawnRate(1000);
    setLevel(0);
    setIsGameOver(false);
    setGameStatus("playing");
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex flex-col items-center justify-center relative overflow-hidden md:pb-10 pb-0">

        <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
          Shooter
        </h1>

        <div className="flex items-center gap-6 text-xl font-mono">
          <div className="w-[160px] text-left text-2xl text-pink-400">
            Score: {score}
          </div>

          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`text-2xl text-red-500 transition-all ${
                  i < lives ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
              >
                ❤
              </span>
            ))}
          </div>
        </div>

        <div className="relative w-[520px] h-[520px] md:mt-10 bg-[#0d1323] rounded-3xl border border-cyan-500/30 overflow-hidden transform scale-70 sm:scale-100">

          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-14 h-14 bg-cyan-400 shadow-[0_0_20px_#22d3ee] transition-transform duration-100"
              style={{
                clipPath: 'polygon(0 50%, 100% 0, 100% 100%)',
                transform: `rotate(${direction === "left" ? "0deg" : "180deg"})`
              }}
            />
          </div>

          {enemies.map((e) => (
            <div
              key={e.id}
              className={`absolute top-1/2 -translate-y-1/2 rounded-full ${
                e.hp === 2 ? "w-12 h-12 bg-red-500" : "w-10 h-10 bg-pink-500"
              }`}
              style={{ left: e.x }}
            />
          ))}

          {shots.map((s) => (
            <div
              key={s.id}
              className="absolute top-1/2 w-3 h-3 bg-yellow-400 rounded-full"
              style={{ left: s.x }}
            />
          ))}

          {isGameOver && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-6 z-50 backdrop-blur-sm animate-in fade-in duration-300">
              <h2 className="text-5xl font-black text-white italic drop-shadow-[0_4px_0_rgba(0,0,0,1)]">GAME OVER!</h2>
              <div className="text-xl font-mono text-cyan-400 font-bold bg-slate-800/50 px-4 py-2 rounded-lg">
                SCORE: {score}
              </div>
              <button onClick={resetGame} className="px-10 py-4 cursor-pointer bg-yellow-400 text-black font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                TRY AGAIN
              </button>
            </div>
          )}
        </div>
        {/* ================= 🎮 MOBILE TOUCH CONTROLS ================= */}
        {/* ⚙ تظهر فقط على الشاشات الأصغر من SM */}
        <div className="flex flex-row gap-5 justify-center w-full max-w-[340px] h-20 md:hidden">
            
            
              <button
                  onClick={() => setDirection("left")}
                  className="flex-1  bg-white/10 rounded-xl text-3xl active:bg-white/30 touch-none"
                  aria-label="Move Left"
                  disabled={isGameOver}
              >
                  ←
              </button>
              
              <button
                  onClick={() => setDirection("right")}
                  className="flex-1 bg-white/10 rounded-xl text-3xl active:bg-white/30 touch-none"
                  aria-label="Move Right"
                  disabled={isGameOver}
              >
                  →
              </button>

            {/* زر إطلاق النار (Fire) */}
            <button
                onClick={shoot}
                className={`flex-[1.5] bg-red-500/50 rounded-xl text-3xl active:bg-red-500/80 border-2 border-red-500/20 touch-none`}
                aria-label="Shoot"
                disabled={!canShoot || isGameOver}
            >
                🔥
            </button>
        </div>
      </div>
    </PageWrapper>
  );
}