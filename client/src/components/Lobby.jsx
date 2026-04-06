import React, { useState } from 'react';

export default function Lobby({ socket, onJoined }) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const join = (newRoom = false) => {
    if (!name.trim()) return setError('Enter your name');
    const room = newRoom
      ? Math.random().toString(36).slice(2, 6).toUpperCase()
      : roomId.trim().toUpperCase();
    if (!room) return setError('Enter a room code');

    socket.emit('room:join', { roomId: room, playerName: name.trim() });
    socket.once('room:joined', ({ roomId: rid, playerId }) => {
      onJoined({ roomId: rid, playerId, playerName: name.trim() });
    });
    socket.once('room:error', msg => setError(msg));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Righteous', cursive",
      padding: 24,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Righteous&family=Nunito:wght@400;600;800&display=swap" rel="stylesheet" />

      {/* Logo */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{
          fontSize: 96, fontWeight: 900, letterSpacing: -4,
          background: 'linear-gradient(180deg, #fff 0%, #f4c430 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textShadow: 'none', lineHeight: 1,
          filter: 'drop-shadow(0 4px 24px #f4c43088)',
        }}>UNO</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, letterSpacing: 4, fontFamily: "'Nunito', sans-serif" }}>
          MULTIPLAYER
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 20,
        padding: '40px 48px',
        width: '100%', maxWidth: 400,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, letterSpacing: 2, fontFamily: "'Nunito',sans-serif" }}>YOUR NAME</label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="Enter your name"
            style={{
              width: '100%', marginTop: 8, padding: '12px 16px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10, color: '#fff', fontSize: 16,
              fontFamily: "'Nunito', sans-serif", outline: 'none', boxSizing: 'border-box',
            }}
            onKeyDown={e => e.key === 'Enter' && join()}
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, letterSpacing: 2, fontFamily: "'Nunito',sans-serif" }}>ROOM CODE (to join existing)</label>
          <input
            value={roomId}
            onChange={e => { setRoomId(e.target.value.toUpperCase()); setError(''); }}
            placeholder="e.g. AB12"
            maxLength={6}
            style={{
              width: '100%', marginTop: 8, padding: '12px 16px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10, color: '#fff', fontSize: 16, letterSpacing: 4,
              fontFamily: "'Righteous', cursive", outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <div style={{ color: '#ff6b6b', marginBottom: 16, fontSize: 13, fontFamily: "'Nunito',sans-serif", textAlign: 'center' }}>
            {error}
          </div>
        )}

        <button
          onClick={() => join(false)}
          style={{
            width: '100%', padding: '14px', marginBottom: 12,
            background: 'linear-gradient(135deg, #e63946, #c1121f)',
            border: 'none', borderRadius: 12, color: '#fff',
            fontSize: 16, fontFamily: "'Righteous', cursive", cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(230, 57, 70, 0.5)',
            transition: 'transform 0.1s',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          JOIN ROOM
        </button>

        <button
          onClick={() => join(true)}
          style={{
            width: '100%', padding: '14px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 12, color: '#fff',
            fontSize: 16, fontFamily: "'Righteous', cursive", cursor: 'pointer',
            transition: 'transform 0.1s',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          CREATE NEW ROOM
        </button>
      </div>

      <div style={{ marginTop: 24, color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: "'Nunito',sans-serif" }}>
        2–8 players · Share room code to invite friends
      </div>
    </div>
  );
}
