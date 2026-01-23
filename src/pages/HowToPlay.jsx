import { useEffect, useState } from "react";
import PageWrapper from "../PageWrapper";

export default function HowToPlay() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/howToPlay.json`)
      .then((res) => res.json())
      .then((data) => setGames(data.games))
      .catch((err) => console.error("Failed to load JSON:", err));
  }, []);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#0f172a] text-white p-4 sm:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">

        {/* 🕹 Games List */}
        <div className="lg:w-1/3 bg-[#0d1323] rounded-2xl p-4 space-y-3 flex-shrink-0">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">
            Games
          </h2>

          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game)}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${
                selectedGame?.id === game.id
                  ? "bg-cyan-500 text-black"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              🎮 {game.title}
            </button>
          ))}
        </div>

        {/* 📖 Game Details */}
        <div className="flex-1 bg-[#0d1323] rounded-2xl p-6">
          {!selectedGame ? (
            <p className="text-gray-400 text-lg text-center sm:text-left">
              Select a game to see how to play
            </p>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl font-black text-pink-400 mb-4">
                {selectedGame.title}
              </h1>

              <p className="mb-4 text-gray-300 text-sm sm:text-base">
                {selectedGame.description}
              </p>

              {selectedGame.controls && selectedGame.controls.length > 0 && (
                <>
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">
                    Controls
                  </h3>
                  <ul className="list-disc list-inside mb-4 space-y-1 text-sm sm:text-base">
                    {selectedGame.controls.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </>
              )}

              {selectedGame.goal && (
                <>
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">
                    Goal
                  </h3>
                  <p className="mb-4 text-sm sm:text-base">{selectedGame.goal}</p>
                </>
              )}

              {selectedGame.tips && selectedGame.tips.length > 0 && (
                <>
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">
                    Tips
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
                    {selectedGame.tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}