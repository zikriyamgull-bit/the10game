

# THE 10 GAME - Viral Memory Challenge PWA

## Overview
A mobile-first Progressive Web App implementing the TikTok "10 Game" memory challenge with solo (vs AI) and local 2-player modes.

## Screens & Flow

### 1. Home Screen
- Bold neon "THE 10 GAME" title with animated gradient
- Tagline: "How many replacements can you survive?"
- Three buttons: PLAY SOLO, PLAY WITH FRIEND, HOW TO PLAY
- High score display at bottom
- Y2K aesthetic: dark background (#0a0a0f), neon pink/cyan/purple accents

### 2. How To Play Modal
- Quick animated tutorial explaining the rules in 3-4 steps
- Visual examples of number replacement
- "GOT IT" dismiss button

### 3. Game Screen
- Top bar: Round number, total replacements, current streak
- Center: HUGE animated display of current number or replacement word
- Player turn indicator with color coding
- Collapsible active replacements list
- "NEXT ✓" button (large, thumb-friendly) to advance
- "I MESSED UP ✗" button to admit defeat
- AI turns auto-play with brief delay in solo mode

### 4. Replacement Input Screen (overlay when reaching 10)
- Number picker (1-10, excluding already replaced numbers)
- Text input with fun placeholder examples (YEET, BRUH, SHEESH)
- "LOCK IT IN" confirmation button

### 5. Game Over Screen
- "GAME OVER!" with confetti/particle burst animation
- Final score: "Survived X replacements"
- Share button (Web Share API with clipboard fallback)
- PLAY AGAIN and BACK TO MENU buttons

## Game Logic
- Players alternate saying numbers 1-10; replacement words substitute for their numbers
- Reaching 10 triggers a new replacement pick
- AI opponent: 50% base accuracy + 5% per active replacement, with occasional realistic mistakes
- Game ends when a player fails to use the correct replacement

## Design System
- **Colors**: Neon pink (#ff0080), cyber blue (#00d4ff), electric yellow (#ffea00), hot purple (#b026ff) on dark (#0a0a0f)
- **Fonts**: Google Fonts "Righteous" for display, "Inter" for body
- **Animations**: Bounce/scale on number changes, slide-in for replacements, confetti on game over, ripple on button taps
- **Touch targets**: Minimum 44px, large thumb-friendly buttons

## Technical Details
- React Context for game state management
- LocalStorage for high scores, games played, best streak
- PWA manifest.json + service worker for offline support and home screen install
- Framer Motion for animations
- Mobile-first responsive design (portrait primary)
- Share text: "🔥 I survived X replacements in THE 10 GAME! Can you beat me? 💪 #The10Game"

