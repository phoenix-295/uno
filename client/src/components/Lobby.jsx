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
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f1535 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Poppins', sans-serif",
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Animated background orbs */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        right: '-5%',
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(230,57,70,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        animation: 'float 15s ease-in-out infinite',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-15%',
        left: '-5%',
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(45,158,95,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        animation: 'float 18s ease-in-out infinite reverse',
      }} />

      {/* Logo */}
      <div style={{ marginBottom: 56, textAlign: 'center', position: 'relative', zIndex: 1, animation: 'slideInDown 0.8s ease-out' }}>
        <div style={{
          fontSize: 120, fontWeight: 900, letterSpacing: -6,
          background: 'linear-gradient(180deg, #ff4757 0%, #ffa502 50%, #ffd93d 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          filter: 'drop-shadow(0 8px 32px rgba(255, 71, 87, 0.4))',
          fontFamily: "'Space Mono', monospace",
          animation: 'pulse-glow 2.5s ease-in-out infinite',
        }}>UNO</div>
        <div style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: 13,
          letterSpacing: 4,
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 500,
          marginTop: 8,
        }}>
          MULTIPLAYER
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: '48px 56px',
        width: '100%',
        maxWidth: 440,
        backdropFilter: 'blur(40px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 10,
        animation: 'slideInUp 0.8s ease-out 0.2s backwards',
      }}>
        <div style={{ marginBottom: 28 }}>
          <label style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: 10,
            letterSpacing: 2.5,
            fontFamily: "'Poppins',sans-serif",
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>Your Name</label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="Enter your name"
            style={{
              width: '100%',
              marginTop: 10,
              padding: '14px 18px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              color: '#fff',
              fontSize: 15,
              fontFamily: "'Poppins', sans-serif",
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.3s ease',
              caretColor: '#ff4757',
            }}
            onFocus={e => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.borderColor = 'rgba(255,71,87,0.5)';
              e.target.style.boxShadow = '0 0 20px rgba(255,71,87,0.1)';
            }}
            onBlur={e => {
              e.target.style.background = 'rgba(255,255,255,0.06)';
              e.target.style.borderColor = 'rgba(255,255,255,0.12)';
              e.target.style.boxShadow = 'none';
            }}
            onKeyDown={e => e.key === 'Enter' && join()}
          />
        </div>

        <div style={{ marginBottom: 36 }}>
          <label style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: 10,
            letterSpacing: 2.5,
            fontFamily: "'Poppins',sans-serif",
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>Room Code</label>
          <input
            value={roomId}
            onChange={e => { setRoomId(e.target.value.toUpperCase()); setError(''); }}
            placeholder="E.G. AB12"
            maxLength={6}
            style={{
              width: '100%',
              marginTop: 10,
              padding: '14px 18px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              color: '#fff',
              fontSize: 15,
              letterSpacing: 3,
              fontFamily: "'Space Mono', monospace",
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              caretColor: '#ff4757',
            }}
            onFocus={e => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.borderColor = 'rgba(255,71,87,0.5)';
              e.target.style.boxShadow = '0 0 20px rgba(255,71,87,0.1)';
            }}
            onBlur={e => {
              e.target.style.background = 'rgba(255,255,255,0.06)';
              e.target.style.borderColor = 'rgba(255,255,255,0.12)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {error && (
          <div style={{
            color: '#ff6b6b',
            marginBottom: 20,
            fontSize: 13,
            fontFamily: "'Poppins',sans-serif",
            textAlign: 'center',
            animation: 'shake 0.4s ease-in-out',
          }}>
            ⚠ {error}
          </div>
        )}

        <button
          onClick={() => join(false)}
          style={{
            width: '100%',
            padding: '16px 24px',
            marginBottom: 12,
            background: 'linear-gradient(135deg, #ff4757 0%, #ff6348 100%)',
            border: 'none',
            borderRadius: 12,
            color: '#fff',
            fontSize: 15,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(255, 71, 87, 0.35)',
            transition: 'all 0.3s ease',
            letterSpacing: 0.5,
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = 'scale(0.96)';
            e.currentTarget.style.boxShadow = '0 3px 10px rgba(255, 71, 87, 0.2)';
          }}
          onMouseUp={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 71, 87, 0.35)';
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #ff6348 0%, #ff7675 100%)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #ff4757 0%, #ff6348 100%)';
          }}
        >
          JOIN ROOM
        </button>

        <button
          onClick={() => join(true)}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'rgba(255,255,255,0.06)',
            border: '1.5px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            color: '#fff',
            fontSize: 15,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            letterSpacing: 0.5,
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          CREATE NEW ROOM
        </button>
      </div>

      <div style={{
        marginTop: 32,
        color: 'rgba(255,255,255,0.35)',
        fontSize: 11,
        fontFamily: "'Poppins',sans-serif",
        letterSpacing: 0.5,
        position: 'relative',
        zIndex: 1,
      }}>
        2–8 PLAYERS · SHARE ROOM CODE TO INVITE
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-40px) translateX(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 8px 32px rgba(255, 71, 87, 0.4)); transform: scale(1); }
          50% { filter: drop-shadow(0 12px 48px rgba(255, 71, 87, 0.8)); transform: scale(1.02); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
