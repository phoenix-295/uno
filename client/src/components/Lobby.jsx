import React, { useState } from 'react';
import AdUnit from './AdUnit';

export default function Lobby({ socket, onJoined }) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [turnTimeLimit, setTurnTimeLimit] = useState(10);
  const [stackDraw2, setStackDraw2] = useState(false);
  const [drawTillColor, setDrawTillColor] = useState(false);

  const join = (newRoom = false) => {
    if (!name.trim()) return setError('Enter your name to begin');
    const room = newRoom
      ? Math.random().toString(36).slice(2, 6).toUpperCase()
      : roomId.trim().toUpperCase();
    if (!room) return setError('Enter a room code');

    socket.emit('room:join', { roomId: room, playerName: name.trim(), turnTimeLimit: newRoom ? turnTimeLimit : undefined, stackDraw2: newRoom ? stackDraw2 : undefined, drawTillColor: newRoom ? drawTillColor : undefined });
    socket.once('room:joined', ({ roomId: rid, playerId }) => {
      onJoined({ roomId: rid, playerId, playerName: name.trim() });
    });
    socket.once('room:error', msg => setError(msg));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #16161a 0%, #000000 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dynamic Background Mesh Orbs */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-10%',
        width: 600,
        height: 600,
        background: 'radial-gradient(circle, rgba(230,57,70,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        pointerEvents: 'none',
        animation: 'float 20s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: 700,
        height: 700,
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(120px)',
        pointerEvents: 'none',
        animation: 'float 25s ease-in-out infinite reverse',
      }} />

      {/* Main Container */}
      <div style={{
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        animation: 'scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        width: '100%',
        maxWidth: 460,
      }}>
        {/* Iridescent Logo Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontSize: 84,
            fontWeight: 900,
            letterSpacing: -2,
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 0.9,
            marginBottom: 12,
            animation: 'pulseGlow 3s ease-in-out infinite',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            UNO
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 14,
            letterSpacing: 6,
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>
            Multiplayer Nebula
          </p>
        </div>

        {/* Glassmorphic Control Panel */}
        <div className="glass-panel" style={{
          padding: '40px 36px',
          textAlign: 'left',
        }}>
          {/* Your Name Input */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: 11,
              letterSpacing: 2,
              fontWeight: 700,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 10
            }}>
              Your Name
            </label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="Enter player handle..."
              className="text-input"
              maxLength={15}
              onKeyDown={e => e.key === 'Enter' && join()}
            />
          </div>

          {/* Room Code Input */}
          <div style={{ marginBottom: 28 }}>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: 11,
              letterSpacing: 2,
              fontWeight: 700,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 10
            }}>
              Room Code
            </label>
            <input
              value={roomId}
              onChange={e => { setRoomId(e.target.value.toUpperCase()); setError(''); }}
              placeholder="E.G. AB12"
              maxLength={6}
              className="text-input"
              style={{
                fontFamily: "'Fira Code', monospace",
                letterSpacing: 4,
                textTransform: 'uppercase',
              }}
            />
          </div>

          {/* Turn timer selectors (Host options) */}
          <div style={{ marginBottom: 28 }}>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: 11,
              letterSpacing: 2,
              fontWeight: 700,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 12
            }}>
              Turn Timer <span style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: 0, textTransform: 'lowercase' }}>(Host setting)</span>
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[10, 15, 20].map(t => (
                <button
                  key={t}
                  onClick={() => setTurnTimeLimit(t)}
                  type="button"
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    background: turnTimeLimit === t ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: turnTimeLimit === t ? '1.5px solid var(--accent)' : '1.5px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    color: turnTimeLimit === t ? '#fff' : 'var(--text-secondary)',
                    fontSize: 13,
                    fontFamily: "'Fira Code', monospace",
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: turnTimeLimit === t ? '0 0 12px var(--accent-glow)' : 'none',
                  }}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>

          {/* Stack house rule (Host options) */}
          <div style={{ marginBottom: 32 }}>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: 11,
              letterSpacing: 2,
              fontWeight: 700,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 10
            }}>
              House Rules <span style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: 0, textTransform: 'lowercase' }}>(Host setting)</span>
            </label>
            <button
              type="button"
              onClick={() => setStackDraw2(v => !v)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: stackDraw2 ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: stackDraw2 ? '1px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                color: stackDraw2 ? '#fff' : 'var(--text-secondary)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Stack +2 Cards</span>
              <div style={{
                width: 36,
                height: 20,
                borderRadius: 99,
                background: stackDraw2 ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)',
                position: 'relative',
                transition: 'background 0.2s ease',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 3,
                  left: stackDraw2 ? 19 : 3,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                }} />
              </div>
            </button>

            <button
              onClick={() => setDrawTillColor(!drawTillColor)}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 12,
                padding: '12px 16px',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <span>Draw Till Color Match</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>Must draw until matching color/wild is found (Autoplayed!)</span>
              </div>
              <div style={{
                width: 36,
                height: 20,
                borderRadius: 99,
                background: drawTillColor ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)',
                position: 'relative',
                transition: 'background 0.2s ease',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 3,
                  left: drawTillColor ? 19 : 3,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                }} />
              </div>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              color: '#f87171',
              marginBottom: 20,
              fontSize: 13,
              textAlign: 'center',
              background: 'rgba(248, 113, 113, 0.1)',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid rgba(248, 113, 113, 0.2)',
              animation: 'shake 0.4s ease-in-out',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn-primary" onClick={() => join(false)} style={{ width: '100%' }}>
              JOIN ROOM
            </button>
            <button className="btn-secondary" onClick={() => join(true)} style={{ width: '100%' }}>
              CREATE NEW ROOM
            </button>
          </div>
        </div>

        {/* Ad Space */}
        <div style={{
          width: '100%',
          marginTop: 24,
          borderRadius: 16,
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.01)',
          border: '1px dashed rgba(255,255,255,0.05)',
        }}>
          <AdUnit adSlot="8007516946" />
        </div>

        {/* Room limit info */}
        <div style={{
          marginTop: 24,
          color: 'var(--text-muted)',
          fontSize: 12,
          letterSpacing: 1,
          fontWeight: 500,
        }}>
          2–8 players • Real-time synchronization
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
