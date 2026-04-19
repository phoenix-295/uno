import React, { useState } from 'react';
import UnoCard from './UnoCard';

const COLOR_MAP = {
  red: '#ff4757', green: '#2ed573', blue: '#1e90ff',
  yellow: '#ffa502', wild: '#1a1a2e',
};

const COLORS = ['red', 'green', 'blue', 'yellow'];
const COLOR_DOT = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#9b5de5', '#ff6b9d', '#00d2d3', '#ffd93d'];

export default function GameBoard({ socket, gameState, playerId, lobbyState, roomId }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWild, setPendingWild] = useState(null);
  const [animDrawn, setAnimDrawn] = useState(false);
  const [isYourTurnNew, setIsYourTurnNew] = useState(false);
  const [cardPlayed, setCardPlayed] = useState(null);
  const [drawnCard, setDrawnCard] = useState(null);
  const [playableDrawnCard, setPlayableDrawnCard] = useState(null);
  const [drawnCardMessage, setDrawnCardMessage] = useState('');

  if (!gameState) return null;

  const { hand, topCard, currentColor, players, currentPlayerIndex, status, winner, log, deckCount, timeRemaining } = gameState;
  const me = players.find(p => p.id === playerId);
  const isMyTurn = me && players[currentPlayerIndex]?.id === playerId;

  // Trigger animation when it becomes your turn
  React.useEffect(() => {
    if (isMyTurn && !isYourTurnNew) {
      setIsYourTurnNew(true);
      setTimeout(() => setIsYourTurnNew(false), 800);
    }
  }, [isMyTurn]);

  // Listen for drawn card that can be played
  React.useEffect(() => {
    const handleCardDrawn = ({ card, message }) => {
      setPlayableDrawnCard(card);
      setDrawnCardMessage(message);
      // Auto-clear message after 8 seconds if not played
      setTimeout(() => {
        setPlayableDrawnCard(null);
        setDrawnCardMessage('');
      }, 8000);
    };

    socket.on('card:drawn', handleCardDrawn);
    return () => socket.off('card:drawn', handleCardDrawn);
  }, [socket]);

  const canPlayCard = (card) => {
    if (!isMyTurn) return false;
    if (card.value === 'wild' || card.value === 'wild4') return true;
    if (card.color === currentColor) return true;
    if (topCard && card.value === topCard.value) return true;
    return false;
  };

  const handleCardClick = (card) => {
    if (!isMyTurn) return;
    if (!canPlayCard(card)) return;
    if (card.value === 'wild' || card.value === 'wild4') {
      setPendingWild(card);
      setShowColorPicker(true);
      setSelectedCard(card.id);
    } else {
      setSelectedCard(card.id);
      setCardPlayed(card.id);
      setTimeout(() => setCardPlayed(null), 600);
      // Clear playable drawn card notification
      setPlayableDrawnCard(null);
      setDrawnCardMessage('');
      socket.emit('card:play', { cardId: card.id });
      setSelectedCard(null);
    }
  };

  const handleColorChoice = (color) => {
    setCardPlayed(pendingWild.id);
    setTimeout(() => setCardPlayed(null), 600);
    // Clear playable drawn card notification
    setPlayableDrawnCard(null);
    setDrawnCardMessage('');
    socket.emit('card:play', { cardId: pendingWild.id, chosenColor: color });
    setShowColorPicker(false);
    setPendingWild(null);
    setSelectedCard(null);
  };

  const handleDraw = () => {
    if (!isMyTurn) return;
    setAnimDrawn(true);
    setDrawnCard(true);
    socket.emit('card:draw');
    setTimeout(() => {
      setAnimDrawn(false);
      setDrawnCard(false);
    }, 600);
  };

  const handleUno = () => socket.emit('uno:call');

  if (status === 'finished') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f1535 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Poppins', sans-serif",
        color: '#fff',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

        {/* Celebrating confetti particles */}
        <div style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
        }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: Math.random() * 8 + 4,
                height: Math.random() * 8 + 4,
                background: ['#ff4757', '#2ed573', '#1e90ff', '#ffa502'][i % 4],
                left: Math.random() * 100 + '%',
                top: '-10px',
                borderRadius: '50%',
                animation: `fall ${Math.random() * 2 + 2.5}s linear forwards`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        <div style={{ fontSize: 120, marginBottom: 20, animation: 'bounce 0.6s ease-in-out' }}>
          🎉
        </div>
        <h1 style={{
          fontSize: 56,
          margin: '0 0 12px',
          fontWeight: 800,
          background: 'linear-gradient(180deg, #ff4757 0%, #ffa502 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'slideDown 0.6s ease-out',
        }}>
          {winner?.id === playerId ? 'YOU WIN!' : `${winner?.name} WINS!`}
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.6)',
          fontFamily: "'Poppins',sans-serif",
          fontSize: 16,
          marginBottom: 40,
          animation: 'slideUp 0.6s ease-out 0.1s backwards',
        }}>
          {winner?.id === playerId ? '🏆 Congratulations!' : 'Better luck next time! 💪'}
        </p>
        <button
          onClick={() => socket.emit('game:restart')}
          style={{
            padding: '16px 56px',
            background: 'linear-gradient(135deg, #ff4757 0%, #ff6348 100%)',
            border: 'none',
            borderRadius: 12,
            color: '#fff',
            fontSize: 16,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255,71,87,0.4)',
            transition: 'all 0.3s ease',
            letterSpacing: 0.5,
            animation: 'slideUp 0.6s ease-out 0.2s backwards',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(255,71,87,0.5)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,71,87,0.4)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          PLAY AGAIN
        </button>

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: scale(0); }
            50% { transform: scale(1.2); }
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fall {
            to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  const currentPlayerObj = players[currentPlayerIndex];
  const nextPlayerIndex = ((currentPlayerIndex + gameState.direction) % players.length + players.length) % players.length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0a0e27 0%, #1a1a3e 50%, #0f1535 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Poppins', sans-serif",
      color: '#fff',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Playable drawn card notification */}
      {playableDrawnCard && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #2ed573 0%, #1ecc71 100%)',
          color: '#fff',
          padding: '14px 28px',
          borderRadius: 12,
          zIndex: 998,
          fontFamily: "'Poppins', sans-serif",
          boxShadow: '0 8px 24px rgba(46,213,115,0.4)',
          fontWeight: 600,
          fontSize: 14,
          animation: 'slideDown 0.4s ease-out',
        }}>
          {drawnCardMessage}
        </div>
      )}

      {/* Top bar */}
<div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'rgba(0,0,0,0.2)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          backdropFilter: 'blur(10px)',
          animation: 'slideDown 0.5s ease-out',
        }}>
        <div style={{
          fontSize: 10,
          letterSpacing: 2,
          color: 'rgba(255,255,255,0.5)',
          fontWeight: 600,
          fontFamily: "'Poppins',sans-serif",
        }}>
          ROOM{' '}
          <span style={{
            color: '#ffa502',
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
          }}>
            {roomId}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 18px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.1)',
          animation: isMyTurn ? `${isYourTurnNew ? 'yourTurnPulse' : 'pulse-status'} 1.5s ease-in-out ${isYourTurnNew ? 'forwards' : 'infinite'}` : 'none',
        }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: COLOR_MAP[currentColor] || '#fff',
            boxShadow: `0 0 12px ${COLOR_MAP[currentColor] || '#fff'}`,
            animation: isMyTurn ? 'glow 1.5s ease-in-out infinite' : 'none',
          }} />
          <span style={{
            fontSize: 12,
            fontFamily: "'Poppins',sans-serif",
            fontWeight: 600,
            color: isMyTurn ? '#2ed573' : 'rgba(255,255,255,0.7)',
          }}>
            {isMyTurn ? '⚡ YOUR TURN' : `${currentPlayerObj?.name}'s turn`}
          </span>
          {isMyTurn && timeRemaining !== null && (
            <span style={{
              marginLeft: 8,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "'Space Mono', monospace",
              color: timeRemaining <= 3 ? '#ff4757' : timeRemaining <= 5 ? '#ffa502' : '#2ed573',
              animation: timeRemaining <= 3 ? 'pulse 0.5s ease-in-out infinite' : 'none',
            }}>
              {timeRemaining}s
            </span>
          )}
        </div>

        <div style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: 1,
          fontWeight: 600,
          fontFamily: "'Poppins',sans-serif",
        }}>
          {gameState.direction === 1 ? '→' : '←'} {players.length} players
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* Round Table */}
        <div style={{
          flex: 1,
          position: 'relative',
          minHeight: 300,
          overflow: 'visible',
        }}>
          {/* Table felt circle */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 210,
            height: 210,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(30,50,110,0.22) 0%, rgba(10,20,55,0.12) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 0 60px rgba(0,0,0,0.15)',
          }} />

          {/* Center: draw pile + direction + top card */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            zIndex: 2,
            animation: cardPlayed ? 'topCardFlash 0.4s ease-out' : 'none',
          }}>
            {/* Draw pile */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                onClick={handleDraw}
                style={{
                  width: 68,
                  height: 102,
                  background: 'linear-gradient(135deg, #ff4757 25%, #ff6348 100%)',
                  borderRadius: 9,
                  border: '2px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isMyTurn ? 'pointer' : 'default',
                  boxShadow: isMyTurn
                    ? isYourTurnNew ? '0 0 40px rgba(255,71,87,0.8)' : '0 0 28px rgba(255,71,87,0.5)'
                    : '0 8px 20px rgba(0,0,0,0.3)',
                  transform: animDrawn ? 'scale(0.92)' : 'translateY(0)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  opacity: isMyTurn ? 1 : 0.6,
                  animation: drawnCard ? 'drawShake 0.5s ease-in-out' : 'none',
                }}
                onMouseEnter={e => { if (isMyTurn) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 0 36px rgba(255,71,87,0.6)'; } }}
                onMouseLeave={e => { if (isMyTurn) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(255,71,87,0.5)'; } }}
              >
                <span style={{ fontSize: 28, opacity: 0.9 }}>🂠</span>
              </div>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontFamily: "'Poppins',sans-serif", fontWeight: 600 }}>
                {deckCount} LEFT
              </span>
            </div>

            {/* Direction + color */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 22, opacity: 0.65, lineHeight: 1 }}>
                {gameState.direction === 1 ? '↻' : '↺'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: '3px 9px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLOR_MAP[currentColor] || '#fff', boxShadow: `0 0 8px ${COLOR_MAP[currentColor] || '#fff'}` }} />
                <span style={{ fontSize: 9, fontFamily: "'Poppins',sans-serif", color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                  {currentColor?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Top card */}
            {topCard && (
              <UnoCard
                card={{
                  ...topCard,
                  color: topCard.color === 'wild' ? topCard.chosenColor || 'wild' : topCard.color,
                  chosenColor: topCard.chosenColor,
                }}
              />
            )}
          </div>

          {/* Players around the table */}
          {players.map((p, i) => {
            const N = players.length;
            const myIdx = players.findIndex(pl => pl.id === playerId);
            const offset = (i - myIdx + N) % N;
            const angle = (Math.PI / 2) + (offset * 2 * Math.PI / N);
            const xPct = 50 + 40 * Math.cos(angle);
            const yPct = 50 + 36 * Math.sin(angle);
            const isCurrent = players[currentPlayerIndex]?.id === p.id;
            const isNext = players[nextPlayerIndex]?.id === p.id && !isCurrent;
            const isMe = p.id === playerId;

            return (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: `${xPct}%`,
                  top: `${yPct}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  zIndex: 3,
                  transition: 'all 0.4s ease',
                }}
              >
                {/* Status badge */}
                <div style={{
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: "'Poppins',sans-serif",
                  letterSpacing: 1,
                  color: isCurrent ? '#ffa502' : isNext ? 'rgba(120,200,255,0.9)' : 'transparent',
                  background: isCurrent ? 'rgba(255,165,2,0.18)' : isNext ? 'rgba(100,180,255,0.12)' : 'transparent',
                  padding: '2px 7px',
                  borderRadius: 4,
                  border: isCurrent ? '1px solid rgba(255,165,2,0.35)' : isNext ? '1px solid rgba(100,180,255,0.25)' : '1px solid transparent',
                  minWidth: 66,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  transition: 'all 0.4s ease',
                }}>
                  {isCurrent ? '▶ PLAYING' : isNext ? '◎ NEXT' : '\u00A0'}
                </div>

                {/* Avatar with countdown circle */}
                <div style={{
                  position: 'relative',
                  width: isCurrent ? 52 : 40,
                  height: isCurrent ? 52 : 40,
                  flexShrink: 0,
                }}>
                  {/* Countdown circle for current player */}
                  {isCurrent && timeRemaining !== null && (
                    <svg
                      style={{
                        position: 'absolute',
                        top: -4,
                        left: -4,
                        width: isCurrent ? 60 : 48,
                        height: isCurrent ? 60 : 48,
                        transform: 'rotate(-90deg)',
                        zIndex: 1,
                      }}
                    >
                      <circle
                        cx={isCurrent ? 30 : 24}
                        cy={isCurrent ? 30 : 24}
                        r={isCurrent ? 28 : 22}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                        fill="none"
                      />
                      <circle
                        cx={isCurrent ? 30 : 24}
                        cy={isCurrent ? 30 : 24}
                        r={isCurrent ? 28 : 22}
                        stroke={timeRemaining <= 3 ? '#ff4757' : timeRemaining <= 5 ? '#ffa502' : '#2ed573'}
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * (isCurrent ? 28 : 22)}`}
                        strokeDashoffset={`${2 * Math.PI * (isCurrent ? 28 : 22) * (1 - timeRemaining / 10)}`}
                        style={{
                          transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease',
                        }}
                      />
                    </svg>
                  )}
                  <div style={{
                    width: isCurrent ? 52 : 40,
                    height: isCurrent ? 52 : 40,
                    borderRadius: '50%',
                    background: COLOR_DOT[i % COLOR_DOT.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isCurrent ? 19 : 14,
                    fontWeight: 700,
                    color: '#fff',
                    border: isCurrent
                      ? '3px solid #ffa502'
                      : isNext
                        ? '2px solid rgba(120,200,255,0.75)'
                        : '2px solid rgba(255,255,255,0.12)',
                    boxShadow: isCurrent
                      ? '0 0 0 5px rgba(255,165,2,0.18), 0 0 30px rgba(255,165,2,0.75)'
                      : isNext
                        ? '0 0 0 3px rgba(100,180,255,0.15), 0 0 18px rgba(100,180,255,0.55)'
                        : '0 4px 10px rgba(0,0,0,0.4)',
                    transition: 'all 0.4s ease',
                    animation: isCurrent ? 'playerPulse 1.8s ease-in-out infinite' : 'none',
                    position: 'relative',
                    zIndex: 2,
                  }}>
                    {p.name[0].toUpperCase()}
                  </div>
                </div>

                {/* Name + card count */}
                <div style={{
                  background: isCurrent
                    ? 'rgba(255,165,2,0.15)'
                    : isNext
                      ? 'rgba(100,180,255,0.1)'
                      : 'rgba(0,0,0,0.55)',
                  border: `1px solid ${isCurrent ? 'rgba(255,165,2,0.4)' : isNext ? 'rgba(100,180,255,0.25)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 8,
                  padding: '3px 10px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.4s ease',
                }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "'Poppins',sans-serif",
                    color: isCurrent ? '#ffa502' : isNext ? 'rgba(160,220,255,0.95)' : 'rgba(255,255,255,0.85)',
                    whiteSpace: 'nowrap',
                    maxWidth: 90,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {p.name}{isMe ? ' (you)' : ''}
                  </div>
                  <div style={{
                    fontSize: 9,
                    fontFamily: "'Poppins',sans-serif",
                    fontWeight: 500,
                    color: isCurrent ? 'rgba(255,165,2,0.8)' : 'rgba(255,255,255,0.4)',
                    marginTop: 1,
                  }}>
                    {p.cardCount} card{p.cardCount !== 1 ? 's' : ''}
                    {p.saidUno && <span style={{ color: '#ff4757', fontWeight: 700 }}> UNO!</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Log */}
        <div
          style={{
            padding: '12px 24px',
            flexShrink: 0,
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {[...log]
            .reverse()
            .slice(0, 4)
            .map((l, i) => (
              <div
                key={i}
                style={{
                  background:
                    i === 0
                      ? 'rgba(255,165,2,0.1)'
                      : 'rgba(255,255,255,0.03)',
                  border:
                    i === 0
                      ? '1px solid rgba(255,165,2,0.2)'
                      : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: '6px 14px',
                  flexShrink: 0,
                  fontSize: 10,
                  color: i === 0
                    ? 'rgba(255,255,255,0.85)'
                    : 'rgba(255,255,255,0.35)',
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: i === 0 ? 600 : 400,
                  transition: 'all 0.3s ease',
                }}
              >
                {l}
              </div>
            ))}
        </div>

        {/* Player hand */}
        <div
          style={{
            padding: '16px 24px 24px',
            background: 'rgba(0,0,0,0.2)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
            backdropFilter: 'blur(10px)',
            animation: 'slideUp 0.6s ease-out 0.2s backwards',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: 2.5,
                color: 'rgba(255,255,255,0.5)',
                fontWeight: 600,
                fontFamily: "'Poppins',sans-serif",
                textTransform: 'uppercase',
              }}
            >
              YOUR HAND ({hand?.length || 0})
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => socket.emit('cards:sort')}
                style={{
                  padding: '8px 20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 20,
                  color: '#fff',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  letterSpacing: 0.5,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                SORT
              </button>
              {hand?.length === 1 && (
                <button
                  onClick={handleUno}
                  style={{
                    padding: '8px 24px',
                    background:
                      'linear-gradient(135deg, #ff4757 0%, #ff6348 100%)',
                    border: 'none',
                    borderRadius: 20,
                    color: '#fff',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow:
                      '0 0 20px rgba(255,71,87,0.5)',
                    animation: isYourTurnNew ? 'unoBounce 0.8s ease-out' : 'pulse 1.2s ease-in-out infinite',
                    transition: 'all 0.3s ease',
                    letterSpacing: 0.5,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow =
                      '0 0 28px rgba(255,71,87,0.7)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow =
                      '0 0 20px rgba(255,71,87,0.5)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  UNO!
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 8,
              alignItems: 'flex-end',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.15) transparent',
              animation: isYourTurnNew ? 'handBounce 0.6s ease-out' : 'none',
            }}
          >
            {(hand || []).map((card) => (
              <div
                key={card.id}
                style={{
                  animation: cardPlayed === card.id ? 'cardFly 0.6s ease-in-out forwards' : (isYourTurnNew && isMyTurn && canPlayCard(card)) ? 'cardGlow 0.8s ease-out' : 'none',
                  position: 'relative',
                }}
              >
                {/* Highlight drawn card */}
                {playableDrawnCard && card.id === playableDrawnCard.id && (
                  <div style={{
                    position: 'absolute',
                    inset: -8,
                    borderRadius: 12,
                    border: '3px solid #2ed573',
                    boxShadow: '0 0 20px rgba(46,213,115,0.6)',
                    pointerEvents: 'none',
                    animation: 'pulse-border 1s ease-in-out infinite',
                  }} />
                )}
                <UnoCard
                  card={card}
                  onClick={() => handleCardClick(card)}
                  selected={selectedCard === card.id}
                  playable={isMyTurn && canPlayCard(card)}
                  isYourTurn={isYourTurnNew}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Color picker modal */}
      {showColorPicker && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              background: 'rgba(20,20,40,0.75)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 24,
              padding: 40,
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            <div
              style={{
                marginBottom: 28,
                fontSize: 18,
                letterSpacing: 2,
                fontWeight: 700,
                fontFamily: "'Poppins', sans-serif",
                color: '#fff',
              }}
            >
              CHOOSE COLOR
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => handleColorChoice(c)}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 14,
                    background: COLOR_MAP[c],
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: `0 6px 24px ${COLOR_MAP[c]}66`,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.12)';
                    e.currentTarget.style.boxShadow = `0 12px 36px ${COLOR_MAP[c]}99`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = `0 6px 24px ${COLOR_MAP[c]}66`;
                  }}
                  onMouseDown={(e) =>
                    (e.currentTarget.style.transform = 'scale(1.08)')
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = 'scale(1)')
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255,71,87,0.5); }
          50% { box-shadow: 0 0 32px rgba(255,71,87,0.8); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 12px rgba(46,213,115,0.4); }
          50% { box-shadow: 0 0 20px rgba(46,213,115,0.8); }
        }
        @keyframes pulse-status {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes yourTurnPulse {
          0% {
            box-shadow: 0 0 20px rgba(46,213,115,0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 40px rgba(46,213,115,1);
            transform: scale(1.05);
          }
          100% {
            box-shadow: 0 0 20px rgba(46,213,115,0.4);
            transform: scale(1);
          }
        }
        @keyframes drawShake {
          0%, 100% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(-8px) translateY(-8px); }
          50% { transform: translateX(8px) translateY(8px); }
          75% { transform: translateX(-8px) translateY(8px); }
        }
        @keyframes cardFly {
          0% {
            opacity: 1;
            transform: translateY(0) translateX(0) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-100px) translateX(-50px) scale(0.8) rotate(-20deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) translateX(-100px) scale(0.5) rotate(-45deg);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes handBounce {
          0% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0); }
        }
        @keyframes unoBounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes topCardFlash {
          0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          50% { transform: translate(-50%, -50%) scale(1.1) rotate(5deg); }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
        }
        @keyframes cardGlow {
          0% { filter: drop-shadow(0 0 0px transparent); }
          50% { filter: drop-shadow(0 0 20px rgba(255,255,255,0.4)); }
          100% { filter: drop-shadow(0 0 0px transparent); }
        }
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 20px rgba(46,213,115,0.6); }
          50% { box-shadow: 0 0 30px rgba(46,213,115,1); }
        }
        @keyframes playerPulse {
          0%, 100% { box-shadow: 0 0 0 5px rgba(255,165,2,0.18), 0 0 30px rgba(255,165,2,0.75); }
          50% { box-shadow: 0 0 0 8px rgba(255,165,2,0.28), 0 0 48px rgba(255,165,2,1); }
        }
      `}</style>
    </div>
  );
}
