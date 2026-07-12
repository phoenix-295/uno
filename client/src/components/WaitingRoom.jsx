import React, { useState } from 'react';
import AdUnit from './AdUnit';

const COLOR_DOT = ['var(--color-red-start, #ff3366)', 'var(--color-green-start, #00f5a0)', 'var(--color-blue-start, #00c6ff)', 'var(--color-yellow-start, #f7b733)', '#9b5de5', '#ff6b9d', '#00d2d3', '#ffd93d'];

export default function WaitingRoom({ socket, roomId, playerId, lobbyState }) {
  const [copied, setCopied] = useState(false);

  if (!lobbyState) return null;
  const { players, host, turnTimeLimit, stackDraw2, drawTillColor } = lobbyState;
  const me = players.find(p => p.id === playerId);
  const isHost = host === socket.id;
  const allReady = players.length >= 2 && players.every(p => p.ready);

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomId);
    } else {
      const el = document.createElement('textarea');
      el.value = roomId;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      color: '#fff',
      position: 'relative',
      overflow: 'auto',
    }}>
      {/* Dynamic Background Mesh Orbs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '-10%',
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(90px)',
        pointerEvents: 'none',
        animation: 'float 18s ease-in-out infinite',
      }} />

      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: 'center', position: 'relative', zIndex: 10, animation: 'scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div style={{ fontSize: 44, marginBottom: 8, animation: 'float 6s ease-in-out infinite' }}>🃏</div>
        <h1 style={{
          fontSize: 36,
          margin: 0,
          letterSpacing: 2,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: "'Space Grotesk', sans-serif"
        }}>
          WAITING ROOM
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
          Prepare for the game
        </p>
      </div>

      {/* Room code and stats bar */}
      <div className="glass-panel" style={{
        padding: '16px 28px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: 500,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: 10,
            letterSpacing: 2,
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            Room Code
          </div>
          <span style={{
            fontSize: 26,
            letterSpacing: 4,
            fontFamily: "'Fira Code', monospace",
            fontWeight: 700,
            background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {roomId}
          </span>
        </div>

        {/* Turn timer status */}
        {turnTimeLimit && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingLeft: 20,
            borderLeft: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: '2px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Fira Code', monospace",
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--accent)',
              boxShadow: '0 0 10px var(--accent-glow)'
            }}>
              {turnTimeLimit}s
            </div>
            <div style={{
              fontSize: 9,
              letterSpacing: 1.5,
              color: 'var(--text-secondary)',
              fontWeight: 700,
              textTransform: 'uppercase',
              lineHeight: 1.3,
            }}>
              Turn<br/>Limit
            </div>
          </div>
        )}

        <button
          onClick={handleCopyCode}
          className="btn-secondary"
          style={{
            padding: '10px 16px',
            fontSize: 13,
            borderRadius: 12,
            border: copied ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
            background: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
            color: copied ? '#10b981' : '#fff'
          }}
          title="Copy room code"
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>

      {/* Players List Card */}
      <div className="glass-panel" style={{
        padding: 24,
        width: '100%',
        maxWidth: 500,
        marginBottom: 24,
        position: 'relative',
        zIndex: 10,
        maxHeight: '40vh',
        overflowY: 'auto',
      }}>
        <div style={{
          fontSize: 11,
          letterSpacing: 2,
          color: 'var(--text-secondary)',
          marginBottom: 16,
          fontWeight: 700,
          textTransform: 'uppercase',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Players ({players.length}/8)</span>
          <span style={{ color: allReady ? '#10b981' : 'var(--text-muted)' }}>
            {allReady ? 'Ready to launch' : 'Waiting for ready'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {players.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 16px',
                background: p.id === playerId ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.01)',
                border: `1px solid ${p.id === playerId ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 14,
                transition: 'all 0.3s ease',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: COLOR_DOT[i % COLOR_DOT.length],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 800,
                color: '#060814',
                boxShadow: `0 0 12px ${COLOR_DOT[i % COLOR_DOT.length]}50`,
              }}>
                {p.name[0].toUpperCase()}
              </div>

              {/* Name */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  {p.name}
                  {p.id === playerId && (
                    <span style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 600 }}>
                      (you)
                    </span>
                  )}
                  {host === p.id && (
                    <span style={{
                      color: 'var(--color-yellow-start, #f7b733)',
                      fontSize: 10,
                      fontWeight: 800,
                      background: 'rgba(247,183,51,0.1)',
                      border: '1px solid rgba(247,183,51,0.2)',
                      borderRadius: 4,
                      padding: '1px 5px',
                    }}>
                      👑 HOST
                    </span>
                  )}
                </div>
              </div>

              {/* Score display */}
              <div style={{
                marginRight: 16,
                fontSize: 13,
                fontWeight: 800,
                color: 'var(--color-yellow-start, #ffcc00)',
                background: 'rgba(255, 204, 0, 0.08)',
                border: '1px solid rgba(255, 204, 0, 0.15)',
                padding: '2px 8px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                🏆 {p.score || 0} PTS
              </div>

              {/* Ready Tag */}
              <div style={{
                fontSize: 12,
                color: p.ready ? '#10b981' : 'var(--text-muted)',
                fontWeight: 700,
              }}>
                {p.ready ? (
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    padding: '2px 8px',
                    borderRadius: 8,
                  }}>
                    READY
                  </span>
                ) : (
                  <span style={{ opacity: 0.6 }}>WAITING</span>
                )}
              </div>

              {/* Kick button */}
              {isHost && p.id !== playerId && (
                <button
                  onClick={() => socket.emit('player:kick', { playerId: p.id })}
                  title={`Kick ${p.name}`}
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    borderRadius: 8,
                    width: 28,
                    height: 28,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: 12,
        width: '100%',
        maxWidth: 500,
        position: 'relative',
        zIndex: 10,
      }}>
        <button
          onClick={() => socket.emit('player:ready')}
          className="btn-secondary"
          style={{
            flex: 1,
            background: me?.ready ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            borderColor: me?.ready ? '#ef4444' : '#10b981',
            color: me?.ready ? '#ef4444' : '#10b981',
          }}
        >
          {me?.ready ? '✕ NOT READY' : '✓ READY UP'}
        </button>

        {isHost && (
          <button
            onClick={() => socket.emit('game:start')}
            disabled={!allReady}
            className="btn-primary"
            style={{
              flex: 1,
              opacity: allReady ? 1 : 0.5,
              cursor: allReady ? 'pointer' : 'not-allowed',
            }}
          >
            🚀 START GAME
          </button>
        )}
      </div>

      {/* Ad Space */}
      <div style={{
        width: '100%',
        maxWidth: 500,
        marginTop: 20,
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        <AdUnit adSlot="8007516946" />
      </div>

      {players.length < 2 && (
        <p style={{
          marginTop: 20,
          color: 'var(--text-muted)',
          fontSize: 13,
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
        }}>
          Waiting for at least 2 players to start...
        </p>
      )}

      {/* Host Settings */}
      {isHost && !lobbyState.gameStarted && (
        <div className="glass-panel" style={{
          marginTop: 24,
          padding: 24,
          width: '100%',
          maxWidth: 500,
          position: 'relative',
          zIndex: 10,
        }}>
          <div style={{
            fontSize: 11,
            letterSpacing: 2,
            color: 'var(--text-secondary)',
            marginBottom: 16,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}>
            Lobby Settings (Host)
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: 10,
              letterSpacing: 2,
              fontWeight: 700,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 10,
            }}>
              Turn Limit
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[10, 15, 20].map(t => (
                <button
                  key={t}
                  onClick={() => socket.emit('room:update-settings', { turnTimeLimit: t })}
                  type="button"
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    background: turnTimeLimit === t ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: turnTimeLimit === t ? '1.5px solid var(--accent)' : '1.5px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 10,
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

          <div>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: 10,
              letterSpacing: 2,
              fontWeight: 700,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 10,
            }}>
              Rule Options
            </label>
            <button
              type="button"
              onClick={() => socket.emit('room:update-settings', { stackDraw2: !stackDraw2 })}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: stackDraw2 ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: stackDraw2 ? '1px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 10,
                color: stackDraw2 ? '#fff' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <span>Stack +2 Cards</span>
              <div style={{
                width: 32,
                height: 18,
                borderRadius: 99,
                background: stackDraw2 ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)',
                position: 'relative',
                transition: 'background 0.2s ease',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 2,
                  left: stackDraw2 ? 16 : 2,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                }} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => socket.emit('room:update-settings', { drawTillColor: !drawTillColor })}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: drawTillColor ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: drawTillColor ? '1px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 10,
                color: drawTillColor ? '#fff' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <span>Draw Till Color Match</span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 400 }}>Must draw until matching color/wild (Autoplayed!)</span>
              </div>
              <div style={{
                width: 32,
                height: 18,
                borderRadius: 99,
                background: drawTillColor ? 'var(--accent)' : 'rgba(255, 255, 255, 0.1)',
                position: 'relative',
                transition: 'background 0.2s ease',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 2,
                  left: drawTillColor ? 16 : 2,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                }} />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
