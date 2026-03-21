import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame, shouldAISucceed } from "@/contexts/GameContext";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function GameScreen() {
  const { state, dispatch } = useGame();
  const [showReplacements, setShowReplacements] = useState(false);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const currentDisplay = state.replacements[state.currentNumber]
    ? state.replacements[state.currentNumber]
    : String(state.currentNumber);

  const isReplacement = !!state.replacements[state.currentNumber];

  // AI auto-play
  useEffect(() => {
    if (state.isAITurn && state.screen === "game") {
      const delay = 800 + Math.random() * 700;
      aiTimerRef.current = setTimeout(() => {
        const replacementCount = Object.keys(state.replacements).length;
        const currentHasReplacement = !!state.replacements[state.currentNumber];
        // AI only risks failing on numbers that actually have a replacement
        if (currentHasReplacement && !shouldAISucceed(replacementCount)) {
          dispatch({ type: "AI_FAILED" });
        } else {
          dispatch({ type: "ADVANCE" });
        }
      }, delay);
      return () => clearTimeout(aiTimerRef.current);
    }
  }, [state.isAITurn, state.currentNumber, state.screen, state.replacements, dispatch]);

  const handleNext = () => {
    if (state.isAITurn) return;
    dispatch({ type: "ADVANCE" });
  };

  const handleFail = () => {
    if (state.isAITurn) return;
    dispatch({ type: "PLAYER_FAILED" });
  };

  const replacementEntries = Object.entries(state.replacements).map(([k, v]) => ({
    num: Number(k),
    word: v,
  }));

  return (
    <div className="flex flex-col min-h-screen px-4 py-6">
      {/* Top bar */}
      <div className="flex justify-between text-sm font-body text-muted-foreground bg-card rounded-lg px-4 py-2">
        <span>Round <strong className="text-foreground">{state.round}</strong></span>
        <span>Replacements <strong className="text-neon-pink">{state.totalReplacements}</strong></span>
        <span>Streak <strong className="text-electric-yellow">{state.streak}</strong></span>
      </div>

      {/* Center display */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${state.currentNumber}-${state.round}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`font-display text-center leading-none ${
              isReplacement
                ? "text-[clamp(3rem,15vw,6rem)] text-neon-pink text-glow-pink"
                : "text-[clamp(5rem,20vw,8rem)] text-foreground"
            }`}
          >
            {currentDisplay}
          </motion.div>
        </AnimatePresence>

        <motion.p
          key={state.currentPlayer}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`font-display text-xl ${
            state.isAITurn ? "text-hot-purple" : state.currentPlayer === 1 ? "text-cyber-blue" : "text-neon-pink"
          }`}
        >
          {state.isAITurn
            ? "AI's Turn..."
            : state.mode === "solo"
            ? "Your Turn"
            : `Player ${state.currentPlayer}'s Turn`}
        </motion.p>
      </div>

      {/* Replacements list */}
      {replacementEntries.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowReplacements(!showReplacements)}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-2 active:opacity-70"
          >
            📝 Active Replacements ({replacementEntries.length})
            {showReplacements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <AnimatePresence>
            {showReplacements && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-1"
              >
                {replacementEntries.map(({ num, word }) => (
                  <div key={num} className="flex gap-2 text-sm bg-card rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">{num}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-neon-pink font-bold">{word}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 pb-4">
        <button
          onClick={handleNext}
          disabled={state.isAITurn}
          className="w-full py-4 rounded-xl bg-success text-background font-display text-xl active:scale-95 transition-transform disabled:opacity-40"
        >
          NEXT ✓
        </button>
        <button
          onClick={handleFail}
          disabled={state.isAITurn}
          className="w-full py-4 rounded-xl bg-fail text-primary-foreground font-display text-xl active:scale-95 transition-transform disabled:opacity-40"
        >
          I MESSED UP ✗
        </button>
      </div>
    </div>
  );
}
