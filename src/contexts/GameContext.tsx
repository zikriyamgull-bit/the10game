import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";

export type GameMode = "solo" | "local" | null;
export type Screen = "home" | "game" | "replacement" | "gameover" | "tutorial" | "roundSummary";

interface GameState {
  screen: Screen;
  mode: GameMode;
  currentNumber: number;
  currentPlayer: 1 | 2;
  replacements: Record<number, string>;
  round: number;
  totalReplacements: number;
  streak: number;
  isAITurn: boolean;
  loser: 1 | 2 | null;
  aiMadeError: boolean;
}

type Action =
  | { type: "START_GAME"; mode: GameMode }
  | { type: "SET_SCREEN"; screen: Screen }
  | { type: "ADVANCE" }
  | { type: "ADD_REPLACEMENT"; number: number; word: string }
  | { type: "PLAYER_FAILED" }
  | { type: "AI_FAILED" }
  | { type: "RESET" };

const initialState: GameState = {
  screen: "home",
  mode: null,
  currentNumber: 1,
  currentPlayer: 1,
  replacements: {},
  round: 1,
  totalReplacements: 0,
  streak: 0,
  isAITurn: false,
  loser: null,
  aiMadeError: false,
};

function getNextPlayer(current: 1 | 2): 1 | 2 {
  return current === 1 ? 2 : 1;
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...initialState,
        screen: "game",
        mode: action.mode,
        currentPlayer: 1,
        isAITurn: false,
      };
    case "SET_SCREEN":
      return { ...state, screen: action.screen };
    case "ADVANCE": {
      if (state.currentNumber === 10) {
        return {
          ...state,
          screen: "replacement",
        };
      }
      const nextPlayer = getNextPlayer(state.currentPlayer);
      return {
        ...state,
        currentNumber: state.currentNumber + 1,
        currentPlayer: nextPlayer,
        isAITurn: state.mode === "solo" && nextPlayer === 2,
        streak: state.streak + 1,
      };
    }
    case "ADD_REPLACEMENT": {
      const newReplacements = { ...state.replacements, [action.number]: action.word };
      const nextPlayer = getNextPlayer(state.currentPlayer);
      return {
        ...state,
        replacements: newReplacements,
        totalReplacements: Object.keys(newReplacements).length,
        round: state.round + 1,
        currentNumber: 1,
        currentPlayer: nextPlayer,
        isAITurn: state.mode === "solo" && nextPlayer === 2,
        screen: "roundSummary",
      };
    }
    case "PLAYER_FAILED":
      return {
        ...state,
        screen: "gameover",
        loser: state.currentPlayer,
        aiMadeError: false,
      };
    case "AI_FAILED":
      return {
        ...state,
        screen: "gameover",
        loser: 2,
        aiMadeError: true,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// AI logic
export function shouldAISucceed(replacementCount: number): boolean {
  let successRate: number;
  if (replacementCount <= 1) {
    // Easy: 35-40% — player builds confidence
    successRate = 0.35 + replacementCount * 0.05;
  } else if (replacementCount <= 4) {
    // Competitive: 60-75% — ramps up fast after round 2
    successRate = 0.55 + (replacementCount - 1) * 0.07;
  } else if (replacementCount <= 7) {
    // Hard: 80-90% — real challenge
    successRate = 0.78 + (replacementCount - 4) * 0.04;
  } else if (replacementCount <= 10) {
    // Very Hard: 90-95%
    successRate = 0.90 + (replacementCount - 7) * 0.02;
  } else {
    // Boss: 95-98%
    successRate = Math.min(0.95 + (replacementCount - 10) * 0.01, 0.98);
  }
  return Math.random() < successRate;
}

// Stats persistence
const STATS_KEY = "the10game_stats";
interface GameStats {
  highScore: number;
  gamesPlayed: number;
  bestStreak: number;
}

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { highScore: 0, gamesPlayed: 0, bestStreak: 0 };
}

export function saveStats(replacements: number, streak: number) {
  const stats = loadStats();
  stats.highScore = Math.max(stats.highScore, replacements);
  stats.bestStreak = Math.max(stats.bestStreak, streak);
  stats.gamesPlayed += 1;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  stats: GameStats;
  refreshStats: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [stats, setStats] = React.useState<GameStats>(loadStats);

  const refreshStats = useCallback(() => {
    setStats(loadStats());
  }, []);

  useEffect(() => {
    if (state.screen === "gameover") {
      saveStats(state.totalReplacements, state.streak);
      refreshStats();
    }
  }, [state.screen, state.totalReplacements, state.streak, refreshStats]);

  return (
    <GameContext.Provider value={{ state, dispatch, stats, refreshStats }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
