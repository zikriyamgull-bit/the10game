import { motion } from "framer-motion";
import { useGame } from "@/contexts/GameContext";
import { Gamepad2, Users, HelpCircle, Trophy } from "lucide-react";

export default function HomeScreen() {
  const { dispatch, stats } = useGame();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 gap-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.7 }}
        className="text-center"
      >
        <h1
          className="font-display text-[clamp(3rem,12vw,5rem)] leading-tight bg-gradient-neon-text"
          style={{ WebkitTextFillColor: "transparent" }}
        >
          THE 10 GAME
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          How many replacements can you survive?
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col gap-4 w-full max-w-xs"
      >
        <button
          onClick={() => dispatch({ type: "START_GAME", mode: "solo" })}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-xl active:scale-95 transition-transform"
        >
          <Gamepad2 className="w-6 h-6" />
          PLAY SOLO
        </button>

        <button
          onClick={() => dispatch({ type: "START_GAME", mode: "local" })}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-secondary text-secondary-foreground font-display text-xl active:scale-95 transition-transform"
        >
          <Users className="w-6 h-6" />
          PLAY WITH FRIEND
        </button>

        <button
          onClick={() => dispatch({ type: "SET_SCREEN", screen: "tutorial" })}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-xl border border-border text-foreground font-display text-xl active:scale-95 transition-transform"
        >
          <HelpCircle className="w-6 h-6" />
          HOW TO PLAY
        </button>
      </motion.div>

      {stats.gamesPlayed > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <Trophy className="w-5 h-5 text-electric-yellow" />
          <span>High Score: <strong className="text-electric-yellow">{stats.highScore}</strong> replacements</span>
        </motion.div>
      )}
    </div>
  );
}
