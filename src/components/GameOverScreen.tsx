import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/contexts/GameContext";
import { Share2, RotateCcw, Home } from "lucide-react";
import Confetti from "@/components/Confetti";

export default function GameOverScreen() {
  const { state, dispatch } = useGame();
  const [shared, setShared] = useState(false);

  const shareText = `🔥 I survived ${state.totalReplacements} replacement${state.totalReplacements !== 1 ? "s" : ""} in THE 10 GAME! Can you beat me? 💪 #The10Game #MemoryChallenge`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(shareText);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const winnerText =
    state.mode === "solo"
      ? state.aiMadeError
        ? "You win! AI messed up! 🎉"
        : "You messed up! 😵"
      : `Player ${state.loser === 1 ? 2 : 1} wins!`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 gap-6 relative overflow-hidden">
      <Confetti />

      <motion.h2
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="font-display text-[clamp(3rem,12vw,5rem)] text-fail text-glow-pink"
      >
        GAME OVER!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-display text-xl text-foreground"
      >
        {winnerText}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-2xl px-8 py-6 text-center"
      >
        <p className="text-muted-foreground text-sm">Survived</p>
        <p className="font-display text-5xl text-electric-yellow text-glow-yellow">
          {state.totalReplacements}
        </p>
        <p className="text-muted-foreground text-sm">replacement{state.totalReplacements !== 1 ? "s" : ""}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-cyber-blue text-secondary-foreground font-display text-lg active:scale-95 transition-transform"
        >
          <Share2 className="w-5 h-5" />
          {shared ? "COPIED!" : "SHARE SCORE"}
        </button>

        <button
          onClick={() => dispatch({ type: "START_GAME", mode: state.mode })}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-lg active:scale-95 transition-transform"
        >
          <RotateCcw className="w-5 h-5" />
          PLAY AGAIN
        </button>

        <button
          onClick={() => dispatch({ type: "RESET" })}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-border text-foreground font-display text-lg active:scale-95 transition-transform"
        >
          <Home className="w-5 h-5" />
          BACK TO MENU
        </button>
      </motion.div>
    </div>
  );
}
