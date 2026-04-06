import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import WaitingRoom from './components/WaitingRoom';
import GameBoard from './components/GameBoard';

const SOCKET_URL = `http://${window.location.hostname}:3001`;

export default function App() {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [screen, setScreen] = useState('lobby');
  const [session, setSession] = useState(null);
  const [lobbyState, setLobbyState] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const s = io(SOCKET_URL);
    socketRef.current = s;
    setSocket(s);

    s.on('lobby:state', (state) => {
      setLobbyState(state);
      if (state.gameStarted) {
        setScreen('game');
      } else {
        setScreen(prev => prev === 'game' ? 'waiting' : prev);
        if (screen === 'game') setGameState(null);
      }
    });

    s.on('game:state', (state) => {
      setGameState(state);
      setScreen('game');
    });

    s.on('game:error', (msg) => {
      setError(msg);
      setTimeout(() => setError(''), 3000);
    });

    return () => s.disconnect();
  }, []);

  const handleJoined = ({ roomId, playerId, playerName }) => {
    setSession({ roomId, playerId, playerName });
    setScreen('waiting');
  };

  if (!socket) return (
    <div style={{ minHeight: '100vh', background: '#0f0c29', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      Connecting...
    </div>
  );

  return (
    <>
      {error && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: '#e63946', color: '#fff', padding: '10px 24px',
          borderRadius: 8, zIndex: 999, fontFamily: "'Righteous', cursive",
          boxShadow: '0 4px 20px rgba(230,57,70,0.5)',
        }}>
          {error}
        </div>
      )}
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
