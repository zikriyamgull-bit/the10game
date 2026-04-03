import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame, shouldAISucceed } from "@/contexts/GameContext";
import PauseMenu from "@/components/PauseMenu";
import { soundManager } from "@/hooks/useSoundManager";

export default function GameScreen() {
  const { state, dispatch } = useGame();
  const aiTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const musicStarted = useRef(false);

  useEffect(() => {
    if (!musicStarted.current) {
      musicStarted.current = true;
      soundManager.startMusic();
    }
    return () => {
      soundManager.stopMusic();
      musicStarted.current = false;
    };
  }, []);

  // Input challenge state
  const [inputValue, setInputValue] = useState("");
  const [triesLeft, setTriesLeft] = useState(3);
  const [showWrong, setShowWrong] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isReplacement = !!state.replacements[state.currentNumber];
  const needsInput = isReplacement && !state.isAITurn;

  // Reset input state when number changes
  useEffect(() => {
    setInputValue("");
    setTriesLeft(3);
    setShowWrong(false);
  }, [state.currentNumber, state.round]);

  // Focus input when challenge appears
  useEffect(() => {
    if (needsInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [needsInput, state.currentNumber]);

  // AI auto-play
  useEffect(() => {
    if (state.isAITurn && state.screen === "game") {
      const delay = 800 + Math.random() * 700;
      aiTimerRef.current = setTimeout(() => {
        const replacementCount = Object.keys(state.replacements).length;
        const currentHasReplacement = !!state.replacements[state.currentNumber];
        // At number 10, always advance to replacement screen (never fail here)
        if (state.currentNumber === 10) {
          dispatch({ type: "ADVANCE" });
        } else if (currentHasReplacement && !shouldAISucceed(replacementCount)) {
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
    if (needsInput) return;
    soundManager.advance();
    dispatch({ type: "ADVANCE" });
  };

  const handleInputSubmit = () => {
    if (!isReplacement) return;
    const correctWord = state.replacements[state.currentNumber];
    if (inputValue.trim().toUpperCase() === correctWord.toUpperCase()) {
      soundManager.correct();
      setInputValue("");
      dispatch({ type: "ADVANCE" });
    } else {
      soundManager.wrong();
      const remaining = triesLeft - 1;
      setTriesLeft(remaining);
      setShowWrong(true);
      setInputValue("");
      setTimeout(() => setShowWrong(false), 600);
      if (remaining <= 0) {
        soundManager.fail();
        dispatch({ type: "PLAYER_FAILED" });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInputSubmit();
    }
  };

  const handleFail = () => {
    if (state.isAITurn) return;
    soundManager.fail();
    dispatch({ type: "PLAYER_FAILED" });
  };

  const replacementEntries = Object.entries(state.replacements).map(([k, v]) => ({
    num: Number(k),
    word: v,
  }));

  // Display: show number for non-replacement, or "?" for replacement (player must type)
  const currentDisplay = needsInput
    ? "?"
    : isReplacement
    ? state.replacements[state.currentNumber]
    : String(state.currentNumber);

  return (
    <div className="flex flex-col min-h-screen px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between text-sm font-body text-muted-foreground bg-card rounded-lg px-4 py-2">
        <PauseMenu />
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
              needsInput
                ? "text-[clamp(5rem,20vw,8rem)] text-electric-yellow text-glow-yellow"
                : isReplacement
                ? "text-[clamp(3rem,15vw,6rem)] text-neon-pink text-glow-pink"
                : "text-[clamp(5rem,20vw,8rem)] text-foreground"
            }`}
          >
            {currentDisplay}
          </motion.div>
        </AnimatePresence>

        {/* Input challenge for replacements */}
        {needsInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 w-full max-w-xs"
          >
            <p className="text-sm text-muted-foreground font-body">
              What replaces <strong className="text-neon-pink">{state.currentNumber}</strong>?
            </p>
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type the word..."
                maxLength={20}
                className={`w-full bg-card border-2 rounded-xl px-4 py-4 text-center font-display text-xl text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
                  showWrong
                    ? "border-fail animate-pulse"
                    : "border-border focus:border-primary"
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Tries left:{" "}
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={i < triesLeft ? "text-electric-yellow" : "text-muted-foreground/30"}>
                    ●
                  </span>
                ))}
              </span>
            </div>
            <button
              onClick={handleInputSubmit}
              disabled={!inputValue.trim()}
              className="w-full py-3 rounded-xl bg-success text-background font-display text-lg active:scale-95 transition-transform disabled:opacity-40"
            >
              SUBMIT ✓
            </button>
          </motion.div>
        )}

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




      {/* Action buttons - only show NEXT when no input challenge */}
      <div className="flex flex-col gap-3 pb-4">
        {!needsInput && (
          <button
            onClick={handleNext}
            disabled={state.isAITurn}
            className="w-full py-4 rounded-xl bg-success text-background font-display text-xl active:scale-95 transition-transform disabled:opacity-40"
          >
            NEXT ✓
          </button>
        )}
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
