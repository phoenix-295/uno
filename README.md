# UNO Multiplayer

Real-time multiplayer Uno — Node.js + Socket.io + React.

## Tech Stack

- **Backend:** Node.js, Express, Socket.io
- **Frontend:** React, Vite

## Local Development

```bash
npm install
npm run dev
```

Runs server on `http://localhost:3001` and client on `http://localhost:5173` concurrently.

## Production Build

```bash
npm run build   # builds client into client/dist
npm run start   # serves everything from port 3001
```

Open `http://localhost:3001`.

## Deploy to Render

| Field | Value |
|---|---|
| Build command | `npm run build` |
| Start command | `npm run start` |
| Root directory | *(leave blank)* |

No environment variables needed.

## Project Structure

```
uno/
├── server/
│   ├── index.js        # Express + Socket.io server
│   ├── gameEngine.js   # Game logic & rules
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Lobby.jsx
│   │   │   ├── WaitingRoom.jsx
│   │   │   ├── GameBoard.jsx
│   │   │   └── UnoCard.jsx
│   │   └── hooks/
│   │       └── useSocket.js
│   └── package.json
└── package.json
```

## How to Play

1. Create a room — get a 4-letter code
2. Share code with other players
3. All players ready up, host starts the game
4. Play matching cards by color or value
5. Draw from deck if no playable card
6. Hit UNO when down to 1 card
7. First to empty hand wins

## Rules

- Number cards 0–9, Skip, Reverse, Draw 2, Wild, Wild Draw 4
- Drawn card playable immediately if it matches current color/value
- 2–8 players
- Deck reshuffles when empty
