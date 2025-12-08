import { useState, useEffect } from "react";
import PageWrapper from "../../PageWrapper";

export default function XO() {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState("X");
  const [winner, setWinner] = useState(null);
  const [mode, setMode] = useState("human"); // human or ai
  const [playerSymbol, setPlayerSymbol] = useState("X");

  const WINNING_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const checkWinner = (board) => {
    for (let line of WINNING_LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    if (board.every((cell) => cell !== "")) return "draw";
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner || (mode === "ai" && turn !== playerSymbol)) return;
    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);
    setTurn(turn === "X" ? "O" : "X");
  };

  const minimax = (board, isMaximizing) => {
    let result = checkWinner(board);
    if (result === playerSymbol) return -10;
    if (result && result !== "draw") return 10;
    if (result === "draw") return 0;

    const aiSymbol = playerSymbol === "X" ? "O" : "X";

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!board[i]) {
          board[i] = aiSymbol;
          const score = minimax(board, false);
          board[i] = "";
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!board[i]) {
          board[i] = playerSymbol;
          const score = minimax(board, true);
          board[i] = "";
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const findBestMove = () => {
    const aiSymbol = playerSymbol === "X" ? "O" : "X";
    let bestScore = -Infinity;
    let move = -1;

    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = aiSymbol;
        let score = minimax(board, false);
        board[i] = "";
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  // AI move effect
  useEffect(() => {
    const result = checkWinner(board);
    if (result) {
      setWinner(result);
      return;
    }

    if (mode === "ai" && turn !== playerSymbol) {
      const move = findBestMove();
      if (move !== -1) {
        const newBoard = [...board];
        newBoard[move] = turn;
        setTimeout(() => {
          setBoard(newBoard);
          setTurn(turn === "X" ? "O" : "X");
        }, 400);
      }
    }
  }, [board, turn]);

  const resetGame = () => {
    setBoard(Array(9).fill(""));
    setWinner(null);
    setTurn("X");
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-6 flex flex-col items-center">

        {/* Title */}
        <h1 className="text-5xl font-extrabold mb-8 tracking-widest bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          XO
        </h1>

        {/* Mode & Symbol */}
        <div className="flex gap-4 mb-6">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="bg-[#111827] px-4 py-2 rounded-xl cursor-pointer"
          >
            <option value="human">Human vs Human</option>
            <option value="ai">Human vs AI</option>
          </select>

          <select
            value={playerSymbol}
            onChange={(e) => setPlayerSymbol(e.target.value)}
            className="bg-[#111827] px-4 py-2 rounded-xl cursor-pointer"
          >
            <option value="X">Play as X</option>
            <option value="O">Play as O</option>
          </select>
        </div>

        {/* Board */}
        <div className="p-4 bg-[#0d1323] rounded-3xl shadow-xl">
          <div className="grid grid-cols-3 gap-3">
            {board.map((cell, index) => (
              <div
                key={index}
                onClick={() => handleClick(index)}
                className=" w-24 h-24 bg-[#141a2e] shadow-inner rounded-2xl flex items-center justify-center text-4xl font-bold cursor-pointer hover:bg-[#1c2740] transition relative neon"
              >
                <span
                className={`
                    ${cell === "X" ? "text-cyan-400 glow-x" : ""}
                    ${cell === "O" ? "text-pink-400 glow-o" : ""}
                    animate-pop
                `}
                >
                    {cell}
                </span>
              </div>
            ))}
          </div>
        </div>
         <button onClick={resetGame} className="mt-4 px-6 py-2 bg-purple-600 rounded-xl hover:bg-transparent border-2 border-transparent hover:border-purple-600 transition cursor-pointer duration-300">
            Play Again
        </button>

        {/* Winner */}
        {winner && (
          <div className="mt-6 text-xl text-center">
            {winner === "draw" ? <p>It's a draw 🤝</p> : <p>Winner: {winner} 🎉</p>}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}