# 🃏 UNO Multiplayer

A real-time multiplayer Uno game built with Node.js + Socket.io + React.

## Quick Start

You need **two terminal windows**.

### Terminal 1 — Start the server
```bash
cd server
node index.js
# Server runs on http://localhost:3001
```

### Terminal 2 — Start the client
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

Then open **http://localhost:5173** in your browser.

## How to Play

1. **Create a room** — click "Create New Room", you'll get a 4-letter room code
2. **Share the code** — other players open the same URL, enter the code and join
3. **Ready up** — all players click "Ready Up"
4. **Host starts** — the host clicks "Start Game" when everyone is ready
5. **Play cards** — click a card to play it (highlighted cards are playable)
6. **Draw a card** — click the draw pile if you can't play
7. **Say UNO!** — click the UNO button when you have 1 card left
8. **Win** — first player to empty their hand wins!

## Rules Implemented

- ✅ All number cards (0-9)
- ✅ Skip
- ✅ Reverse (reverses direction; in 2-player = acts like Skip)
- ✅ Draw 2 (+2)
- ✅ Wild (choose color)
- ✅ Wild Draw 4 (+4, choose color)
- ✅ UNO call
- ✅ Deck reshuffling when empty
- ✅ Turn direction indicator
- ✅ Up to 8 players
- ✅ Play Again after game ends

## Project Structure

```
uno/
├── server/
│   ├── index.js         # Express + Socket.io server
│   ├── gameEngine.js    # Uno game logic
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Lobby.jsx       # Join/create room screen
│   │   │   ├── WaitingRoom.jsx # Pre-game lobby
│   │   │   ├── GameBoard.jsx   # Main game UI
│   │   │   └── UnoCard.jsx     # Card component
│   │   └── hooks/
│   │       └── useSocket.js
│   └── package.json
└── README.md
```
