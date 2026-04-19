const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { createGame, playCard, drawCard, callUno, nextPlayerIndex, drawCards, sortCards } = require('./gameEngine');

// Game constants - hardcoded for consistent gameplay
const TURN_TIME_LIMIT = 10; // 10 seconds per turn
const STALE_CONNECTION_TIMEOUT = 5 * 60 * 1000; // 5 minutes for stale connections
const ABANDONED_GAME_TIMEOUT = 30 * 60 * 1000; // 30 minutes for completely abandoned games
const app = express();
// CORS configuration from environment variables only
const getCorsOrigins = () => {
  const origins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
  
  // Add development origins if not in production
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173', 'http://127.0.0.1:3001');
  }
  
  // Add Render domains if specified
  if (process.env.ALLOW_RENDER_DOMAINS === 'true') {
    origins.push('*.onrender.com');
  }
  
  return origins.filter(Boolean);
};

app.use(cors({
  origin: getCorsOrigins(),
  methods: ['GET', 'POST']
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: getCorsOrigins(),
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// rooms: { [roomId]: { players: [], game: null, host: socketId, turnTimer: null } }
const rooms = {};

// Stale connection cleanup
function cleanupStaleConnections() {
  const now = Date.now();
  for (const [roomId, room] of Object.entries(rooms)) {
    // Check for any active players in the room
    const hasActivePlayers = room.players.some(p => {
      const socket = io.sockets.sockets.get(p.socketId);
      return socket && socket.connected;
    });
    
    // Check for abandoned games (games with no activity for too long)
    if (room.game && !hasActivePlayers) {
      const gameAge = room.game.createdAt ? now - room.game.createdAt : Infinity;
      const lastActivity = room.game.lastActivity || room.game.createdAt || 0;
      const timeSinceActivity = now - lastActivity;
      
      if (timeSinceActivity > ABANDONED_GAME_TIMEOUT) {
        console.log(`[CLEANUP] Removing abandoned game in room ${roomId} (inactive for ${Math.round(timeSinceActivity / 60000)} minutes)`);
        delete rooms[roomId];
        continue;
      }
    }
    
    // Clean up rooms with no active players (regardless of game status)
    if (!hasActivePlayers) {
      // If all players are stale, remove the room entirely
      const allPlayersStale = room.players.every(player => {
        return !player.lastSeen || (now - player.lastSeen) > STALE_CONNECTION_TIMEOUT;
      });
      
      if (allPlayersStale) {
        console.log(`[CLEANUP] Removing abandoned room ${roomId} (game status: ${room.game?.status || 'no game'})`);
        delete rooms[roomId];
        continue;
      }
    }
    
    // Clean up stale players if there are still active players
    const originalLength = room.players.length;
    room.players = room.players.filter(player => {
      const socket = io.sockets.sockets.get(player.socketId);
      const isConnected = socket && socket.connected;
      
      if (!isConnected && (!player.lastSeen || (now - player.lastSeen) > STALE_CONNECTION_TIMEOUT)) {
        console.log(`[CLEANUP] Removing stale player ${player.name} from room ${roomId}`);
        
        // If game is in progress and this was the current player, skip their turn
        if (room.game && room.game.status === 'playing' && 
            room.game.players[room.game.currentPlayerIndex]?.id === player.id) {
          room.game.currentPlayerIndex = nextPlayerIndex(room.game);
          room.game.turnTimerStart = Date.now();
          room.game.log.push(`${player.name} was disconnected. Skipping turn.`);
        }
        
        return false;
      }
      
      return true;
    });
    
    // If room is empty after cleanup, remove it
    if (room.players.length === 0) {
      console.log(`[CLEANUP] Removing empty room ${roomId}`);
      delete rooms[roomId];
      continue;
    }
    
    if (room.players.length !== originalLength) {
      broadcastRoom(roomId);
    }
  }
}

// Run cleanup every 2 minutes
setInterval(cleanupStaleConnections, 2 * 60 * 1000);

function startTurnTimer(roomId) {
  const room = rooms[roomId];
  if (!room || !room.game || room.game.status !== 'playing') return;
  
  if (room.turnTimer) clearInterval(room.turnTimer);
  
  room.turnTimer = setInterval(() => {
    const game = room.game;
    if (!game || game.status !== 'playing') {
      clearInterval(room.turnTimer);
      return;
    }
    
    const elapsed = (Date.now() - game.turnTimerStart) / 1000;
    
    // Broadcast timer updates more frequently for better real-time feel
    broadcastTimerUpdate(roomId);
    
    if (elapsed >= TURN_TIME_LIMIT) {
      const currentPlayer = game.players[game.currentPlayerIndex];
      game.log.push(`${currentPlayer.name} took too long! Drawing a card and passing turn.`);
      
      // Force draw a card
      const drawn = drawCards(game, currentPlayer.id, 1);
      game.log.push(`${currentPlayer.name} draws a card (${drawn[0]?.color} ${drawn[0]?.value})`);
      
      // Move to next player
      game.currentPlayerIndex = nextPlayerIndex(game);
      game.turnTimerStart = Date.now();
      
      // Immediate full broadcast for turn change
      broadcastRoom(roomId);
    }
  }, 200); // Update every 200ms for smoother timer
}

function getRoomSafeState(room, requestingPlayerId = null, timeRemaining = null) {
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
    timeRemaining,
  };
}

function broadcastTimerUpdate(roomId) {
  const room = rooms[roomId];
  if (!room || !room.game) return;
  
  // Only send timer and critical game state - no hands, no logs
  let timeRemaining = null;
  if (room.game.status === 'playing' && room.game.turnTimerStart) {
    const elapsed = (Date.now() - room.game.turnTimerStart) / 1000;
    timeRemaining = Math.max(0, Math.ceil(TURN_TIME_LIMIT - elapsed));
  }
  
  const timerState = {
    currentPlayerIndex: room.game.currentPlayerIndex,
    timeRemaining,
    topCard: room.game.discardPile[room.game.discardPile.length - 1],
    currentColor: room.game.currentColor,
    status: room.game.status
  };
  
  for (const player of room.players) {
    const socket = io.sockets.sockets.get(player.socketId);
    if (socket) {
      socket.emit('game:timer', timerState);
    }
  }
}

function broadcastRoom(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  // Send each player their own hand (only when a game is active)
  if (room.game) {
    // Calculate time remaining
    let timeRemaining = null;
    if (room.game.status === 'playing' && room.game.turnTimerStart) {
      const elapsed = (Date.now() - room.game.turnTimerStart) / 1000;
      timeRemaining = Math.max(0, Math.ceil(TURN_TIME_LIMIT - elapsed));
    }
    for (const player of room.players) {
      const socket = io.sockets.sockets.get(player.socketId);
      if (socket) {
        socket.emit('game:state', getRoomSafeState(room, player.id, timeRemaining));
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
      rooms[roomId] = { players: [], game: null, host: socket.id, turnTimer: null };
    }
    const room = rooms[roomId];

    // Reconnection check
    const existing = room.players.find(p => p.name === playerName);
    if (existing) {
      existing.socketId = socket.id;
      existing.lastSeen = Date.now();
      socket.join(roomId);
      socket.emit('room:joined', { roomId, playerId: existing.id });
      broadcastRoom(roomId);
      console.log(`${playerName} reconnected to room ${roomId}`);
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
      lastSeen: Date.now(),
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
    startTurnTimer(roomId);
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
    room.game.turnTimerStart = Date.now();
    
    // Immediate broadcast for card play - critical for real-time feel
    broadcastRoom(roomId);
    
    // Also send immediate timer update
    broadcastTimerUpdate(roomId);
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

    room.game.turnTimerStart = Date.now();

    // If the drawn card is playable, notify the player
    if (result.canPlayDrawn && result.drawn && result.drawn[0]) {
      const drawnCard = result.drawn[0];
      socket.emit('card:drawn', {
        card: drawnCard,
        message: `You drew a ${drawnCard.color} ${drawnCard.value}! You can play it now or skip.`
      });
    }

    // Immediate broadcast for draw action
    broadcastRoom(roomId);
    
    // Also send immediate timer update
    broadcastTimerUpdate(roomId);
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

  socket.on('cards:sort', () => {
    const { roomId, playerId } = socket.data;
    const room = rooms[roomId];
    if (!room || !room.game) return;
    
    // Sort the player's hand
    room.game.hands[playerId] = sortCards(room.game.hands[playerId]);
    broadcastRoom(roomId);
  });

  // Heartbeat to track activity
  socket.on('heartbeat', () => {
    const { roomId, playerId } = socket.data;
    if (roomId && rooms[roomId]) {
      const player = rooms[roomId].players.find(p => p.id === playerId);
      if (player) {
        player.lastSeen = Date.now();
      }
    }
  });

  socket.on('disconnect', () => {
    const { roomId, playerId } = socket.data;
    if (!roomId || !rooms[roomId]) return;
    const room = rooms[roomId];
    
    // Mark player as disconnected but keep for reconnection
    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.lastSeen = Date.now(); // Mark when they disconnected
    }
    
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

app.get('/admin/cleanup', (_, res) => {
  const beforeCount = Object.keys(rooms).length;
  cleanupStaleConnections();
  const afterCount = Object.keys(rooms).length;
  res.json({ 
    status: 'cleanup completed', 
    roomsRemoved: beforeCount - afterCount,
    totalRooms: afterCount,
    rooms: Object.keys(rooms)
  });
});

const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🎮 Uno server running on http://0.0.0.0:${PORT}`));
