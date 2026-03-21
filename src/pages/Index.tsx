import { GameProvider, useGame } from "@/contexts/GameContext";
import HomeScreen from "@/components/HomeScreen";
import GameScreen from "@/components/GameScreen";
import ReplacementScreen from "@/components/ReplacementScreen";
import GameOverScreen from "@/components/GameOverScreen";
import TutorialScreen from "@/components/TutorialScreen";
import { AnimatePresence, motion } from "framer-motion";

function GameRouter() {
  const { state } = useGame();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.screen}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen"
      >
        {state.screen === "home" && <HomeScreen />}
        {state.screen === "game" && <GameScreen />}
        {state.screen === "replacement" && <ReplacementScreen />}
        {state.screen === "gameover" && <GameOverScreen />}
        {state.screen === "tutorial" && <TutorialScreen />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Index() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}
