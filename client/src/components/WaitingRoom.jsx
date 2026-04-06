import React, { useState } from 'react';

const COLOR_DOT = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#9b5de5', '#ff6b9d', '#00d2d3', '#ffd93d'];

export default function WaitingRoom({ socket, roomId, playerId, lobbyState }) {
  const [copied, setCopied] = useState(false);

  if (!lobbyState) return null;
  const { players, host } = lobbyState;
  const me = players.find(p => p.id === playerId);
  const isHost = host === socket.id;
  const allReady = players.length >= 2 && players.every(p => p.ready);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f1535 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Poppins', sans-serif",
      padding: 24,
      color: '#fff',
      position: 'relative',
      overflow: 'auto',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Animated background orbs */}
      <div style={{
        position: 'fixed',
        top: '20%',
        right: '-10%',
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, rgba(45,213,115,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        animation: 'float 12s ease-in-out infinite',
      }} />

      <div style={{ marginBottom: 40, textAlign: 'center', position: 'relative', zIndex: 1, animation: 'slideInDown 0.6s ease-out' }}>
        <div style={{ fontSize: 48, marginBottom: 12, animation: 'bounce 0.8s ease-in-out 0.2s' }}>🃏</div>
        <h1 style={{
          fontSize: 42,
          margin: 0,
          letterSpacing: 2,
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 800,
          background: 'linear-gradient(180deg, #ff4757 0%, #ffa502 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'fadeInScale 0.7s ease-out 0.1s backwards',
        }}>
          WAITING ROOM
        </h1>
      </div>

      {/* Room code */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '14px 28px',
        marginBottom: 40,
        backdropFilter: 'blur(40px)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        position: 'relative',
        zIndex: 1,
      }}>
        <div>
          <div style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 10,
            letterSpacing: 2,
            fontFamily: "'Poppins',sans-serif",
            fontWeight: 600,
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            Room Code
          </div>
          <span style={{
            fontSize: 28,
            letterSpacing: 4,
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
          }}>
            {roomId}
          </span>
        </div>
        <button
          onClick={handleCopyCode}
          style={{
            background: copied ? 'rgba(46,213,115,0.2)' : 'rgba(255,71,87,0.1)',
            border: `1.5px solid ${copied ? 'rgba(46,213,115,0.5)' : 'rgba(255,255,255,0.15)'}`,
            color: copied ? '#2ed573' : 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            fontSize: 16,
            borderRadius: 10,
            padding: '10px 14px',
            transition: 'all 0.3s ease',
            fontWeight: 600,
          }}
          title="Copy room code"
        >
          {copied ? '✓ Copied' : '📋'}
        </button>
      </div>

      {/* Players list */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 28,
        width: '100%',
        maxWidth: 480,
        marginBottom: 32,
        backdropFilter: 'blur(40px)',
        position: 'relative',
        zIndex: 1,
        maxHeight: '45vh',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.15) transparent',
      }}>
        <div style={{
          fontSize: 10,
          letterSpacing: 2.5,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 20,
          fontFamily: "'Poppins',sans-serif",
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          Players ({players.length}/8)
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {players.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                background: p.id === playerId ? 'rgba(255,71,87,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${p.id === playerId ? 'rgba(255,71,87,0.2)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 12,
                transition: 'all 0.3s ease',
                animation: `slideInLeft 0.5s ease-out ${i * 0.1}s backwards`,
              }}
            >
              <div style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: COLOR_DOT[i % COLOR_DOT.length],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                color: '#fff',
                boxShadow: `0 4px 12px ${COLOR_DOT[i % COLOR_DOT.length]}40`,
              }}>
                {p.name[0].toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#fff',
                }}>
                  {p.name}
                  {p.id === playerId && (
                    <span style={{
                      color: '#ffa502',
                      fontSize: 12,
                      marginLeft: 8,
                      fontWeight: 600,
                    }}>
                      (you)
                    </span>
                  )}
                  {isHost && p.id === playerId && (
                    <span style={{
                      color: '#ff4757',
                      fontSize: 11,
                      marginLeft: 6,
                      fontWeight: 700,
                    }}>
                      ★ HOST
                    </span>
                  )}
                </div>
              </div>

              <div style={{
                fontSize: 12,
                fontFamily: "'Poppins',sans-serif",
                color: p.ready ? '#2ed573' : 'rgba(255,255,255,0.4)',
                fontWeight: p.ready ? 700 : 500,
                transition: 'all 0.3s ease',
              }}>
                {p.ready ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    ✓ READY
                  </span>
                ) : (
                  <span style={{ opacity: 0.6 }}>Waiting...</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        gap: 12,
        width: '100%',
        maxWidth: 480,
        position: 'relative',
        zIndex: 1,
      }}>
        <button
          onClick={() => socket.emit('player:ready')}
          style={{
            flex: 1,
            padding: '16px 24px',
            background: me?.ready
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(135deg, #2ed573 0%, #1ecc71 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            color: me?.ready ? 'rgba(255,255,255,0.5)' : '#fff',
            fontSize: 14,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: me?.ready ? 'none' : '0 6px 20px rgba(46,213,115,0.3)',
            transition: 'all 0.3s ease',
            letterSpacing: 0.5,
          }}
          onMouseEnter={e => {
            if (!me?.ready) {
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(46,213,115,0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={e => {
            if (!me?.ready) {
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,213,115,0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
          onMouseDown={e => {
            if (!me?.ready) e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseUp={e => {
            if (!me?.ready) e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {me?.ready ? 'NOT READY' : '✓ READY UP'}
        </button>

        {isHost && (
          <button
            onClick={() => socket.emit('game:start')}
            disabled={!allReady}
            style={{
              flex: 1,
              padding: '16px 24px',
              background: allReady
                ? 'linear-gradient(135deg, #ff4757 0%, #ff6348 100%)'
                : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              color: allReady ? '#fff' : 'rgba(255,255,255,0.3)',
              fontSize: 14,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              cursor: allReady ? 'pointer' : 'not-allowed',
              boxShadow: allReady ? '0 6px 20px rgba(255,71,87,0.3)' : 'none',
              transition: 'all 0.3s ease',
              letterSpacing: 0.5,
            }}
            onMouseEnter={e => {
              if (allReady) {
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(255,71,87,0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={e => {
              if (allReady) {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,71,87,0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
            onMouseDown={e => {
              if (allReady) e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={e => {
              if (allReady) {
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            START GAME
          </button>
        )}
      </div>

      {players.length < 2 && (
        <p style={{
          marginTop: 28,
          color: 'rgba(255,255,255,0.35)',
          fontSize: 12,
          fontFamily: "'Poppins',sans-serif",
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          Waiting for at least 2 players...
        </p>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-40px); }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.25);
        }
      `}</style>
    </div>
  );
}
