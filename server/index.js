const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { createGame, playCard, drawCard, callUno } = require('./gameEngine');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// rooms: { [roomId]: { players: [], game: null, host: socketId } }
const rooms = {};

function getRoomSafeState(room, requestingPlayerId = null) {
  if (!room.game) return null;
  const game = room.game;
  return {
    players: game.players,
    discardPile: game.discardPile.slice(-3),
    topCard: game.discardPile[game.discardPile.length - 1],
    currentColor: game.currentColor,
    currentPlayerIndex: game.currentPlayerIndex,
    direction: game.direction,
    deckCount: game.deck.length,
    status: game.status,
    winner: game.winner,
    log: game.log.slice(-8),
    hand: requestingPlayerId ? game.hands[requestingPlayerId] : [],
  };
}

function broadcastRoom(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  // Send each player their own hand (only when a game is active)
  if (room.game) {
    for (const player of room.players) {
      const socket = io.sockets.sockets.get(player.socketId);
      if (socket) {
        socket.emit('game:state', getRoomSafeState(room, player.id));
      }
    }
  }
  // Also send lobby state
  io.to(roomId).emit('lobby:state', {
    roomId,
    players: room.players.map(p => ({ id: p.id, name: p.name, ready: p.ready })),
    host: room.host,
    gameStarted: !!room.game && room.game.status !== 'finished',
    gameFinished: !!room.game && room.game.status === 'finished',
  });
}

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('room:join', ({ roomId, playerName }) => {
    roomId = roomId.toUpperCase().trim();
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [], game: null, host: socket.id };
    }
    const room = rooms[roomId];

    // Reconnection check
    const existing = room.players.find(p => p.name === playerName);
    if (existing) {
      existing.socketId = socket.id;
      socket.join(roomId);
      socket.emit('room:joined', { roomId, playerId: existing.id });
      broadcastRoom(roomId);
      return;
    }

    if (room.game && room.game.status === 'playing') {
      socket.emit('room:error', 'Game already in progress');
      return;
    }
    if (room.players.length >= 8) {
      socket.emit('room:error', 'Room is full (max 8 players)');
      return;
    }

    const player = {
      id: `${socket.id}-${Date.now()}`,
      socketId: socket.id,
      name: playerName || `Player${room.players.length + 1}`,
      ready: false,
    };
    room.players.push(player);
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.playerId = player.id;

    socket.emit('room:joined', { roomId, playerId: player.id });
    broadcastRoom(roomId);
    console.log(`${player.name} joined room ${roomId}`);
  });

  socket.on('player:ready', () => {
    const { roomId, playerId } = socket.data;
    const room = rooms[roomId];
    if (!room) return;
    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.ready = !player.ready;
      broadcastRoom(roomId);
    }
  });

  socket.on('game:start', () => {
    const { roomId } = socket.data;
    const room = rooms[roomId];
    if (!room) return;
    if (room.host !== socket.id) {
      socket.emit('room:error', 'Only host can start the game');
      return;
    }
    if (room.players.length < 2) {
      socket.emit('room:error', 'Need at least 2 players');
      return;
    }
    room.game = createGame(roomId, room.players);
    broadcastRoom(roomId);
    console.log(`Game started in room ${roomId}`);
  });

  socket.on('card:play', ({ cardId, chosenColor }) => {
    const { roomId, playerId } = socket.data;
    const room = rooms[roomId];
    if (!room || !room.game) return;

    const result = playCard(room.game, playerId, cardId, chosenColor);
    if (result.error) {
      socket.emit('game:error', result.error);
      return;
    }
    broadcastRoom(roomId);
  });

  socket.on('card:draw', () => {
    const { roomId, playerId } = socket.data;
    const room = rooms[roomId];
    if (!room || !room.game) return;

    const result = drawCard(room.game, playerId);
    if (result.error) {
      socket.emit('game:error', result.error);
      return;
    }

    // If the drawn card is playable, notify the player
    if (result.canPlayDrawn && result.drawn && result.drawn[0]) {
      const drawnCard = result.drawn[0];
      socket.emit('card:drawn', {
        card: drawnCard,
        message: `🎉 You drew a ${drawnCard.color} ${drawnCard.value}! You can play it now or skip.`
      });
    }

    broadcastRoom(roomId);
  });

  socket.on('uno:call', () => {
    const { roomId, playerId } = socket.data;
    const room = rooms[roomId];
    if (!room || !room.game) return;
    const result = callUno(room.game, playerId);
    if (!result.error) broadcastRoom(roomId);
  });

  socket.on('player:kick', ({ playerId }) => {
    const { roomId } = socket.data;
    const room = rooms[roomId];
    if (!room || room.host !== socket.id) return;
    if (room.game && room.game.status === 'playing') {
      socket.emit('room:error', 'Cannot kick players during a game');
      return;
    }
    const target = room.players.find(p => p.id === playerId);
    if (!target) return;
    const targetSocket = io.sockets.sockets.get(target.socketId);
    if (targetSocket) {
      targetSocket.emit('kicked', 'You were kicked by the host');
      targetSocket.leave(roomId);
    }
    room.players = room.players.filter(p => p.id !== playerId);
    broadcastRoom(roomId);
    console.log(`Player ${target.name} was kicked from room ${roomId}`);
  });

  socket.on('game:restart', () => {
    const { roomId } = socket.data;
    const room = rooms[roomId];
    if (!room || room.host !== socket.id) return;
    room.game = null;
    room.players.forEach(p => p.ready = false);
    broadcastRoom(roomId);
  });

  socket.on('disconnect', () => {
    const { roomId, playerId } = socket.data;
    if (!roomId || !rooms[roomId]) return;
    const room = rooms[roomId];
    // Don't remove player immediately - allow reconnect
    // If host leaves, transfer host
    if (room.host === socket.id) {
      const other = room.players.find(p => p.socketId !== socket.id);
      if (other) room.host = other.socketId;
    }
    broadcastRoom(roomId);
    console.log(`Socket ${socket.id} disconnected from room ${roomId}`);
  });
});

app.get('/health', (_, res) => res.json({ status: 'ok', rooms: Object.keys(rooms).length }));

const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🎮 Uno server running on http://0.0.0.0:${PORT}`));
