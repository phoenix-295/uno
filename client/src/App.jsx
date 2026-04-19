import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import WaitingRoom from './components/WaitingRoom';
import GameBoard from './components/GameBoard';

const SOCKET_URL = import.meta.env.PROD ? window.location.origin : `http://${window.location.hostname}:3001`;

export default function App() {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [screen, setScreen] = useState('lobby');
  const [session, setSession] = useState(null);
  const [lobbyState, setLobbyState] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const s = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  upgrade: true,
  rememberUpgrade: true
});
    socketRef.current = s;
    setSocket(s);

    // Send heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (s.connected) {
        s.emit('heartbeat');
      }
    }, 30000);

    s.on('lobby:state', (state) => {
      setLobbyState(state);
      if (state.gameStarted) {
        setScreen('game');
      } else if (!state.gameFinished) {
        setScreen(prev => prev === 'game' ? 'waiting' : prev);
        if (screen === 'game') setGameState(null);
      }
    });

    s.on('game:state', (state) => {
      setGameState(state);
      setScreen('game');
    });

    s.on('game:timer', (timerState) => {
      // Only update timer and critical state - don't overwrite full game state
      setGameState(prev => prev ? { ...prev, ...timerState } : timerState);
    });

    s.on('game:error', (msg) => {
      setError(msg);
      setTimeout(() => setError(''), 3000);
    });

    s.on('kicked', (msg) => {
      setError(msg);
      setSession(null);
      setLobbyState(null);
      setGameState(null);
      setScreen('lobby');
    });

    return () => {
      clearInterval(heartbeatInterval);
      s.disconnect();
    };
  }, []);

  const handleJoined = ({ roomId, playerId, playerName }) => {
    setSession({ roomId, playerId, playerName });
    setScreen('waiting');
  };

  if (!socket) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f1535 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontFamily: "'Poppins', sans-serif",
      fontSize: 16,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700;800&display=swap" rel="stylesheet" />
      Connecting...
    </div>
  );

  return (
    <>
      {error && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #ff4757 0%, #ff6348 100%)',
          color: '#fff',
          padding: '12px 28px',
          borderRadius: 12,
          zIndex: 999,
          fontFamily: "'Poppins', sans-serif",
          boxShadow: '0 8px 24px rgba(255,71,87,0.4)',
          fontWeight: 600,
          fontSize: 14,
          animation: 'slideDown 0.3s ease-out',
        }}>
          ⚠ {error}
        </div>
      )}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      {screen === 'lobby' && <Lobby socket={socket} onJoined={handleJoined} />}
      {screen === 'waiting' && session && (
        <WaitingRoom socket={socket} roomId={session.roomId} playerId={session.playerId} lobbyState={lobbyState} />
      )}
      {screen === 'game' && session && (
        <GameBoard socket={socket} gameState={gameState} playerId={session.playerId} lobbyState={lobbyState} roomId={session.roomId} />
      )}
    </>
  );
}
