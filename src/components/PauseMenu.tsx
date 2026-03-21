import { motion, AnimatePresence } from "framer-motion";
import { Pause, Volume2, VolumeX, Home, X } from "lucide-react";
import { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { useSoundManager, soundManager } from "@/hooks/useSoundManager";

export default function PauseMenu() {
  const [open, setOpen] = useState(false);
  const { dispatch } = useGame();
  const { muted, toggleMute } = useSoundManager();

  const handleOpen = () => {
    soundManager.click();
    setOpen(true);
  };

  const handleClose = () => {
    soundManager.click();
    setOpen(false);
  };

  const handleMainMenu = () => {
    soundManager.click();
    dispatch({ type: "RESET" });
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Pause"
      >
        <Pause className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-xs flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-foreground">PAUSED</h2>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={toggleMute}
                className="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-muted text-foreground font-display text-lg active:scale-95 transition-transform"
              >
                {muted ? (
                  <>
                    <VolumeX className="w-5 h-5 text-fail" />
                    UNMUTE SOUND
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 text-success" />
                    MUTE SOUND
                  </>
                )}
              </button>

              <button
                onClick={handleMainMenu}
                className="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-muted text-foreground font-display text-lg active:scale-95 transition-transform"
              >
                <Home className="w-5 h-5 text-electric-yellow" />
                MAIN MENU
              </button>

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display text-lg active:scale-95 transition-transform"
              >
                RESUME
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
