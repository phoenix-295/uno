# UNO Multiplayer

Real-time multiplayer Uno — Node.js + Socket.io + React.

## 🌟 Key Features & Custom Rules

* **Premium Obsidian Theme**: Sleek, high-contrast pitch-black (`#000000`) background with glassmorphism menus, glowing neon borders, and interactive card hover states.
* **Vector Card Styles**: Programmatic, high-fidelity card fronts featuring classic outer white borders, tilted central ellipses, black outlines, drop shadows, and conic-gradient wild segments.
* **3D Fly Animations**: Real-time synchronized flying card transitions. Watch cards fly smoothly from the draw deck into hands, and from hands onto the center discard pile.
* **AFK Auto Mode (Robot Play)**: Toggle `🤖 Auto Mode` to let the game play automatically for you during your turn, avoiding unnecessary lobby delays.
* **Persistent Room Leaderboards**: Player points persist and accumulate across multiple rounds in the same room until the lobby is closed.
* **Victory Scorecard**: Compiles score points at the end of each round based on opponents' remaining cards:
  * Number cards (0-9): Face value
  * Action cards (Skip, Reverse, +2): 20 points
  * Wild cards (Wild, Wild Draw 4): 50 points
* **Synthesized Audio Effects**: Native Web Audio API sounds (card slides, draw swipes, deep alarms when timer <= 3s, and arpeggios on UNO calls) with zero asset loading overhead.
* **House Rules**:
  * **Stacking +2**: Draw 2 cards can be stacked continuously to pass the penalty to the next player.
  * **Draw Till Color Match**: Forces players without playable cards to keep drawing until they find a matching color card (which is automatically played).

## ## Tech Stack

- **Backend:** Node.js, Express, Socket.io
- **Frontend:** React, Vite, Web Audio API, Vanilla CSS

## ## Local Development

```bash
npm install
npm run dev
```

Runs server on `http://localhost:3001` and client on `http://localhost:5173` concurrently.

## ## Production Build

```bash
npm run build   # builds client into client/dist
npm run start   # serves everything from port 3001
```

Open `http://localhost:3001`.

## ## Deploy to Render

| Field | Value |
|---|---|
| Build command | `npm run build` |
| Start command | `npm run start` |
| Root directory | *(leave blank)* |

No environment variables needed.

## ## Project Structure

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

## ## How to Play

1. Create a room — get a 4-letter code.
2. Configure settings (turn timers, stacking +2, draw-till-color).
3. Share the code with other players.
4. All players ready up, host starts the game.
5. Play matching cards by color or value.
6. Hit UNO when down to 1 card.
7. First to empty hand wins the round and gains points based on opponent cards!
