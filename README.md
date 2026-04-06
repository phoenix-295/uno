# 🃏 UNO Multiplayer

A real-time multiplayer Uno game built with **Node.js + Socket.io + React** with a polished, modern UI and smooth animations.

## 🎮 Features

- ✨ **Beautiful, modern UI** with glassmorphism effects and vibrant colors
- 🎯 **Real-time multiplayer** gameplay with Socket.io
- 🎨 **Smooth animations** for card plays, turns, and game events
- ⚡ **Instant feedback** when cards are drawn or played
- 🏆 **2–8 players** support
- 📱 **Responsive design** that works on desktop and mobile

## Quick Start

You need **two terminal windows**.

### Terminal 1 — Start the server
```bash
cd server
npm install
node index.js
# Server runs on http://localhost:3001
```

### Terminal 2 — Start the client
```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

Then open **http://localhost:5173** in your browser.

## How to Play

1. **Create a room** — click "Create New Room", you'll get a 4-letter room code
2. **Share the code** — other players open the same URL, enter the code and join
3. **Ready up** — all players click "Ready Up" (green button turns into "NOT READY")
4. **Host starts** — the host clicks "Start Game" when everyone is ready
5. **Play cards** — click a playable card to play it (cards glow when they're playable)
6. **Draw a card** — click the red draw pile if you can't play
   - ✨ If the drawn card is playable, you'll see a **green notification** and the card will be **highlighted with a glowing border**
   - You can immediately play it or skip to the next player
7. **Say UNO!** — click the UNO button when you have 1 card left (bounces when active)
8. **Win** — first player to empty their hand wins! 🎉

## Rules Implemented

### Core Rules
- ✅ All number cards (0-9)
- ✅ Skip (skips next player)
- ✅ Reverse (reverses direction; in 2-player = acts like Skip)
- ✅ Draw 2 (+2)
- ✅ Wild (choose any color)
- ✅ Wild Draw 4 (+4, choose color)
- ✅ UNO call (click when you have 1 card left)
- ✅ Deck reshuffling when empty
- ✅ Turn direction indicator (→ or ←)

### Enhanced Rules
- ✅ **Play drawn cards immediately** — if you draw a card that matches the current color or value, you can play it right away
- ✅ Up to 8 players
- ✅ Play Again after game ends
- ✅ Real-time player status updates

### Game Features
- ✅ Beautiful modern UI with glassmorphism
- ✅ Smooth animations for all game events
- ✅ Visual feedback when it's your turn
- ✅ Card highlighting and glow effects
- ✅ Celebration animation on win
- ✅ Game log showing recent actions

## UI & Design

### Modern Aesthetic
- **Dark theme** with vibrant color accents (Red #ff4757, Green #2ed573, Blue #1e90ff, Yellow #ffa502)
- **Glassmorphism** effects with backdrop blur on panels
- **Custom typography** using Poppins (body) and Space Mono (accent) fonts
- **Smooth animations** with cubic-bezier easing for natural motion

### Animations
- 🎯 **Your Turn** — Turn indicator glows bright with pulsing animation
- 🚀 **Card Play** — Cards fly off with rotation and fade
- 🔄 **Card Draw** — Deck shakes with visual feedback
- ⚡ **Draw Pile** — Glows brighter when it's your turn
- 💫 **Playable Cards** — Draw a matching card? It gets a glowing border
- 🎉 **Win Screen** — Bounce animation with falling confetti particles

## Project Structure

```
uno/
├── server/
│   ├── index.js              # Express + Socket.io server
│   ├── gameEngine.js         # Uno game logic & rules
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx           # Main app component
│   │   ├── components/
│   │   │   ├── Lobby.jsx     # Join/create room screen
│   │   │   ├── WaitingRoom.jsx # Pre-game lobby
│   │   │   ├── GameBoard.jsx # Main game UI
│   │   │   └── UnoCard.jsx   # Card component with animations
│   │   └── hooks/
│   │       └── useSocket.js  # Socket.io connection hook
│   └── package.json
├── .gitignore
└── README.md
```

## Tech Stack

### Backend
- **Node.js** — JavaScript runtime
- **Express** — Web server framework
- **Socket.io** — Real-time bidirectional communication

### Frontend
- **React** — UI library
- **Vite** — Fast build tool and dev server
- **CSS-in-JS** — Inline styles for animations and styling

## Development

### Server Setup
```bash
cd server
npm install
node index.js
```

### Client Setup
```bash
cd client
npm install
npm run dev
```

### Build for Production
```bash
cd client
npm run build
# Output goes to dist/
```
