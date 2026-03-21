import { motion } from "framer-motion";
import { useGame } from "@/contexts/GameContext";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    title: "Count to 10",
    desc: "Take turns counting from 1 to 10 with another player (or AI).",
    emoji: "🔢",
  },
  {
    title: "Replace a Number",
    desc: "When someone says 10, they pick a number (1-10) to replace with any word.",
    emoji: "🔄",
  },
  {
    title: "Remember!",
    desc: 'Count again, but say the word instead of the number. E.g. say "YEET" instead of 5.',
    emoji: "🧠",
  },
  {
    title: "Don't Mess Up!",
    desc: "More replacements get added each round. First to forget LOSES!",
    emoji: "💥",
  },
];

export default function TutorialScreen() {
  const { dispatch } = useGame();

  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-10 gap-6">
      <h2 className="font-display text-3xl bg-gradient-neon-text" style={{ WebkitTextFillColor: "transparent" }}>
        HOW TO PLAY
      </h2>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.15 }}
            className="flex gap-4 items-start bg-card rounded-xl p-4"
          >
            <span className="text-3xl">{step.emoji}</span>
            <div>
              <h3 className="font-display text-lg text-foreground">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-card rounded-xl p-4 w-full max-w-sm"
      >
        <p className="text-sm text-muted-foreground font-display mb-2">Example:</p>
        <div className="text-sm space-y-1 text-foreground">
          <p>1, 2, 3, 4, 5, 6, 7, 8, 9, 10 → replace 5 with <strong className="text-neon-pink">YEET</strong></p>
          <p className="flex items-center gap-1"><ArrowRight className="w-3 h-3 text-cyber-blue" /> 1, 2, 3, 4, <strong className="text-neon-pink">YEET</strong>, 6, 7, 8, 9, 10</p>
        </div>
      </motion.div>

      <button
        onClick={() => dispatch({ type: "SET_SCREEN", screen: "home" })}
        className="mt-4 py-4 px-10 rounded-xl bg-primary text-primary-foreground font-display text-xl active:scale-95 transition-transform"
      >
        GOT IT!
      </button>
    </div>
  );
}
