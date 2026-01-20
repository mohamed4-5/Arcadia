import { useEffect, useState, useRef } from "react";
import PageWrapper from "../../PageWrapper";

const BOARD_HEIGHT = 600;
const MAX_SPEED = 10;

export default function PianoTiles() {
  const [tiles, setTiles] = useState([]);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(6);
  const [spawnRate, setSpawnRate] = useState(900);
  const [gameOver, setGameOver] = useState(false);

  // مرجع (Ref) لمعرفة النتيجة داخل الـ Effects بدون إعادة تشغيلها
  const scoreRef = useRef(0);

  /* ================= ⬇ تحريك الطوب (أداء أفضل) ================= */
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setTiles((prev) =>
        prev.map((t) => ({
          ...t,
          y: t.y + speed,
        }))
      );
    }, 16);

    return () => clearInterval(interval);
  }, [speed, gameOver]);

  /* ================= 🧱 إنشاء الطوب ================= */
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      const col = Math.floor(Math.random() * 4);
      setTiles((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          col,
          y: -150,
        },
      ]);
    }, spawnRate);

    return () => clearInterval(interval);
  }, [spawnRate, gameOver]);

  /* ================= 💀 شروط الخسارة ================= */
  useEffect(() => {
    const outOfBounds = tiles.some((t) => t.y > BOARD_HEIGHT - 50);
    if (outOfBounds && !gameOver) {
      setGameOver(true);
    }
  }, [tiles, gameOver]);

  /* ================= 🔥 زيادة الصعوبة ================= */
  useEffect(() => {
    if (score > 0 && score % 10 === 0) {
      setSpeed((s) => Math.min(s + 0.6, MAX_SPEED));
      setSpawnRate((r) => Math.max(r - 150, 300));
    }
  }, [score]);

  /* ================= ✅ الضغط الصحيح ================= */
  const hitTile = (id) => {
    if (gameOver) return;
    setScore((s) => s + 1);
    setTiles((prev) => prev.filter((t) => t.id !== id));
  };

  /* ================= ⌨ التحكم بالكيبورد ================= */
  const hitColumn = (col) => {
    if (gameOver) return;

    setTiles((prev) => {
      const columnTiles = prev
        .filter((t) => t.col === col)
        .sort((a, b) => b.y - a.y);

      if (columnTiles.length === 0) {
        setGameOver(true);
        return prev;
      }
      
      if (columnTiles[0].y < -100) return prev; 

      setScore((s) => s + 1);
      return prev.filter((t) => t.id !== columnTiles[0].id);
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat || gameOver) return;
      const key = e.key.toLowerCase();
      const keys = { a: 0, s: 1, k: 2, l: 3 };
      if (keys[key] !== undefined) hitColumn(keys[key]);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, tiles]);

  const resetGame = () => {
    setTiles([]);
    setScore(0);
    setSpeed(6);
    setSpawnRate(900);
    setGameOver(false);
  };

  return (
    <PageWrapper>
      {/* ستايل إضافي لمنع أي تهنيج بسبب اللمس المطول */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-select {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
      `}} />

      <div 
        onContextMenu={(e) => e.preventDefault()} // منع القائمة عند الضغط المطول
        className="no-select min-h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center relative touch-none overflow-hidden"
      >
        <h1 className="text-5xl font-black mb-4 tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
          Piano
        </h1>
        
        <div className="text-cyan-400 text-xl font-bold z-10 mb-4">
          SCORE: {score}
        </div>

        <div
          onPointerDown={(e) => {
            if (!gameOver) setGameOver(true);
          }}
          className="relative rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl bg-black/40"
          style={{ 
            height: BOARD_HEIGHT, 
            width: '100%', 
            maxWidth: '400px',
            touchAction: 'none' 
          }}
        >
          {/* Columns Lines */}
          <div className="absolute inset-0 flex h-full w-full pointer-events-none z-0">
            {[0, 1, 2, 3].map((col) => (
              <div key={col} className="flex-1 border-r border-white/10 last:border-r-0 h-full relative">
                <div className="hidden md:block absolute bottom-4 w-full text-center text-white/10 font-bold">
                  {["A", "S", "K", "L"][col]}
                </div>
              </div>
            ))}
          </div>

          {/* Tiles */}
          {tiles.map((tile) => (
            <div
              key={tile.id}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation(); // ✅ يمنع وصول الضغطة للبوردة فلا تخسر
                hitTile(tile.id);
              }}
              className="absolute p-1 z-10 pointer-events-auto"
              style={{
                width: '25%', 
                left: `${tile.col * 25}%`,
                height: 140,
                top: tile.y,
                touchAction: 'none',
              }}
            >
                <div className="w-full h-full rounded-lg bg-gradient-to-b from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.4)] border border-white/20 active:brightness-125 transition-all"></div>
            </div>
          ))}
          {/* Game Over Screen */}
          {gameOver && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-6 z-50 backdrop-blur-sm animate-in fade-in duration-300">
              <h2 className="text-5xl font-black text-white italic drop-shadow-[0_4px_0_rgba(0,0,0,1)]">GAME OVER!</h2>
              <div className="text-xl font-mono text-cyan-400 font-bold bg-slate-800/50 px-4 py-2 rounded-lg">
                SCORE: {score}
              </div>
              <button 
                onPointerDown={(e) => {
                  e.stopPropagation();
                  resetGame();
                }} 
                className="px-10 py-4 cursor-pointer bg-yellow-400 text-black font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(250,204,21,0.4)]"
              >
                TRY AGAIN
              </button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}