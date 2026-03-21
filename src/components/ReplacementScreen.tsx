import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/contexts/GameContext";

const placeholders = ["YEET", "BRUH", "SHEESH", "BUSSIN", "SLAY", "SKIBIDI", "RIZZ", "NO CAP"];

export default function ReplacementScreen() {
  const { state, dispatch } = useGame();
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [word, setWord] = useState("");

  const usedNumbers = Object.keys(state.replacements).map(Number);
  const availableNumbers = Array.from({ length: 10 }, (_, i) => i + 1).filter(
    (n) => !usedNumbers.includes(n)
  );

  const placeholder = placeholders[Math.floor(Math.random() * placeholders.length)];

  const handleSubmit = () => {
    if (selectedNum === null || !word.trim()) return;
    dispatch({ type: "ADD_REPLACEMENT", number: selectedNum, word: word.trim().toUpperCase() });
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-10 gap-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <h2 className="font-display text-2xl text-electric-yellow text-glow-yellow">
          You reached 10! 🎉
        </h2>
        <p className="text-muted-foreground mt-2">
          {state.mode === "solo" && state.currentPlayer === 2
            ? "AI picks a replacement..."
            : "Pick a number to replace:"}
        </p>
      </motion.div>

      {/* Number picker */}
      <div className="grid grid-cols-5 gap-3 w-full max-w-xs">
        {availableNumbers.map((n) => (
          <button
            key={n}
            onClick={() => setSelectedNum(n)}
            className={`py-3 rounded-xl font-display text-lg transition-all active:scale-90 ${
              selectedNum === n
                ? "bg-neon-pink text-primary-foreground scale-110"
                : "bg-card text-foreground"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Word input */}
      <input
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder={placeholder}
        maxLength={20}
        className="w-full max-w-xs bg-card border border-border rounded-xl px-4 py-4 text-center font-display text-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <button
        onClick={handleSubmit}
        disabled={selectedNum === null || !word.trim()}
        className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-display text-xl active:scale-95 transition-transform disabled:opacity-40"
      >
        LOCK IT IN 🔒
      </button>
    </div>
  );
}
