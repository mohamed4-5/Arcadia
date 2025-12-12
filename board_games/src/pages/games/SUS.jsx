import { useState, useEffect } from "react";
import PageWrapper from "../../PageWrapper";

export default function SUS() {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [isPlayerOneTurn, setIsPlayerOneTurn] = useState(true); // true = P1, false = P2/AI
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [gameStatus, setGameStatus] = useState("playing"); // playing, finished
  const [mode, setMode] = useState("human"); // human or ai
  
  // 🔥🔥 تثبيت الحرف لكل لاعب في البداية 🔥🔥
  const [playerOneSymbol, setPlayerOneSymbol] = useState("S"); // S or U
  const playerTwoSymbol = playerOneSymbol === "S" ? "U" : "S";

  // All possible lines to check for S-U-S
  const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  const calculatePointsAdded = (newBoard, index) => {
    let points = 0;
    for (let line of LINES) {
      if (line.includes(index)) {
        const [a, b, c] = line;
        const seq = newBoard[a] + newBoard[b] + newBoard[c];
        // يجب أن نتحقق من جميع التباديل الممكنة للسلسلة SUS
        if (seq === "SUS") {
          points++;
        }
      }
    }
    return points;
  };

  const handleMove = (index) => {
    if (board[index] || gameStatus === "finished") return;
    
    // تحديد الحرف بناءً على الدور المثبت
    const charToPlace = isPlayerOneTurn ? playerOneSymbol : playerTwoSymbol;

    const newBoard = [...board];
    newBoard[index] = charToPlace;
    setBoard(newBoard);

    const pointsGained = calculatePointsAdded(newBoard, index);

    if (pointsGained > 0) {
      setScores(prev => ({
        ...prev,
        [isPlayerOneTurn ? "p1" : "p2"]: prev[isPlayerOneTurn ? "p1" : "p2"] + pointsGained
      }));
    }

    if (!newBoard.includes("")) {
      setGameStatus("finished");
    } else {
      setIsPlayerOneTurn(!isPlayerOneTurn);
    }
  };


  const makeAIMove = () => {
    const emptyIndices = board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
    
    if (emptyIndices.length === 0) return;

    let bestMove = -1;
    const aiSymbol = playerTwoSymbol; 
    let foundScoringMove = false;

    // 1. Try to find a move that scores points immediately
    for (let idx of emptyIndices) {
        let tempBoard = [...board];
        tempBoard[idx] = aiSymbol;
        
        if (calculatePointsAdded(tempBoard, idx) > 0) {
            bestMove = idx;
            foundScoringMove = true;
            break;
        }
    }

    // 2. If no scoring move, pick random 
    if (!foundScoringMove) {
        const randomIndex = Math.floor(Math.random() * emptyIndices.length);
        bestMove = emptyIndices[randomIndex];
    }
    
    const newBoard = [...board];
    newBoard[bestMove] = aiSymbol;
    setBoard(newBoard);

    const pointsGained = calculatePointsAdded(newBoard, bestMove);

    if (pointsGained > 0) {
        setScores(prev => ({
            ...prev,
            p2: prev.p2 + pointsGained
        }));
    }
    
    if (!newBoard.includes("")) {
        setGameStatus("finished");
    } else {
        setIsPlayerOneTurn(true); 
    }
  };

   // AI Logic
  useEffect(() => {
    if (mode === "ai" && !isPlayerOneTurn && gameStatus === "playing") {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isPlayerOneTurn, gameStatus, mode, playerTwoSymbol]); // Added playerTwoSymbol dependency

  const resetGame = () => {
    setBoard(Array(9).fill(""));
    setScores({ p1: 0, p2: 0 });
    setGameStatus("playing");
    setIsPlayerOneTurn(true);
  };

  const getWinnerMessage = () => {
    if (scores.p1 > scores.p2) return "Player 1 Wins! 👑";
    if (scores.p2 > scores.p1) return mode === "ai" ? "AI Wins! 🤖" : "Player 2 Wins! 👑";
    return "It's a Draw! 🤝";
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-6 flex flex-col items-center font-sans">

        {/* Title */}
        <h1 className="text-6xl font-black mb-4 tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
          SUS
        </h1>

        {/* Settings - اختيار وضع اللعب وحرف اللاعب */}
        <div className="flex gap-4 mb-6">
          <select
            value={mode}
            onChange={(e) => { setMode(e.target.value); resetGame(); }}
            className="bg-[#1e293b] border border-slate-600 px-4 py-2 rounded-xl cursor-pointer text-sm hover:border-purple-400 transition"
          >
            <option value="human">1 vs 1 (Human)</option>
            <option value="ai">1 vs AI</option>
          </select>
          
          <select  
            value={playerOneSymbol}  
            onChange={(e) => { setPlayerOneSymbol(e.target.value); resetGame(); }}  
            className="bg-[#1e293b] border border-slate-600 px-4 py-2 rounded-xl cursor-pointer text-sm hover:border-pink-400 transition"  
            // لا يمكن التغيير أثناء اللعب
            disabled={gameStatus === "playing" && (board.some(cell => cell !== ""))} 
          >  
            <option value="S">Player 1 plays as S</option>  
            <option value="U">Player 1 plays as U</option>  
          </select>  
        </div>

        {/* Score Board */}
        <div className="flex justify-between items-center w-full max-w-xs mb-6 bg-[#0d1323] p-4 rounded-2xl border border-slate-700 shadow-lg relative">
            
            <div className={`z-10 flex flex-col items-center transition ${isPlayerOneTurn ? 'scale-110 text-purple-400' : 'text-slate-400'}`}>
                <span className="text-xs font-bold uppercase tracking-widest">Player 1 ({playerOneSymbol})</span>
                <span className="text-3xl font-mono font-bold">{scores.p1}</span>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-700"></div>

            <div className={`z-10 flex flex-col items-center transition ${!isPlayerOneTurn ? 'scale-110 text-pink-400' : 'text-slate-400'}`}>
                <span className="text-xs font-bold uppercase tracking-widest">{mode === 'ai' ? 'AI Bot' : 'Player 2'} ({playerTwoSymbol})</span>
                <span className="text-3xl font-mono font-bold">{scores.p2}</span>
            </div>
        </div>

        {/* Grid */}
        <div className="p-4 bg-[#0d1323] rounded-3xl shadow-2xl border border-slate-800">
          <div className="grid grid-cols-3 gap-3">
            {board.map((cell, index) => (
              <div
                key={index}
                onClick={() => handleMove(index)}
                className={`
                    w-20 h-20 md:w-24 md:h-24 bg-[#141a2e] shadow-inner rounded-2xl flex items-center justify-center text-4xl font-bold cursor-pointer hover:bg-[#1c2740] transition relative neon
                    ${!cell ? 'border-transparent hover:bg-[#1c2740] hover:border-slate-600' : 'border-[#1e293b]'}
                `}
              >
                {/* 🔥🔥 تصحيح إيرور Tailwind: ربط الألوان بالحرف نفسه (S أو U) وليس باللاعب 🔥🔥 */}
                {cell && 
                    <span 
                        className={`  
                            animate-letter-pop  
                            ${cell === 'S' ? 'text-cyan-400 glow-x' : ''}  
                            ${cell === 'U' ? 'text-pink-400 glow-o' : ''}  
                        `}  
                    >  
                        {cell}  
                    </span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Result & Reset */}
        <div className="mt-8 flex flex-col items-center h-20">
            {gameStatus === "finished" ? (
                <div className="animate-fade-in-up text-center">
                    <p className="text-2xl font-bold mb-3 text-white">{getWinnerMessage()}</p>
                    <button onClick={resetGame} className="px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition transform hover:scale-105 active:scale-95 cursor-pointer">
                        Play Again
                    </button>
                </div>
            ) : (
                <button onClick={resetGame} className="text-slate-500 hover:text-white text-sm transition underline decoration-slate-700 underline-offset-4">
                    Reset Board
                </button>
            )}
        </div>

      </div>
    </PageWrapper>
  );
}