import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/contexts/GameContext";

export default function RoundSummaryScreen() {
  const { state, dispatch } = useGame();

  const entries = Object.entries(state.replacements).map(([k, v]) => ({
    num: Number(k),
    word: v,
  }));

  // Auto-continue after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: "SET_SCREEN", screen: "game" });
    }, 2500);
    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-6">
      <motion.h2
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="font-display text-3xl text-electric-yellow text-glow-yellow text-center"
      >
        New Replacement Added! 🔥
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-muted-foreground font-body"
      >
        Memorize these — you'll need them!
      </motion.p>

      <div className="w-full max-w-xs space-y-2">
        {entries.map(({ num, word }, i) => (
          <motion.div
            key={num}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className="flex items-center gap-3 bg-card rounded-xl px-4 py-3"
          >
            <span className="font-display text-2xl text-muted-foreground w-8 text-center">{num}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-display text-xl text-neon-pink text-glow-pink">{word}</span>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs h-1 bg-card rounded-full overflow-hidden mt-4">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 2.5, ease: "linear" }}
          className="h-full bg-electric-yellow rounded-full"
        />
      </div>

      <p className="text-xs text-muted-foreground animate-pulse">
        Continuing in a moment...
      </p>
    </div>
  );
}
