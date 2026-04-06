import React, { useState } from 'react';
import UnoCard from './UnoCard';

const COLOR_MAP = {
  red: '#ff4757', green: '#2ed573', blue: '#1e90ff',
  yellow: '#ffa502', wild: '#1a1a2e',
};

const COLORS = ['red', 'green', 'blue', 'yellow'];

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

  const { hand, topCard, currentColor, players, currentPlayerIndex, status, winner, log, deckCount } = gameState;
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
  const otherPlayers = players.filter(p => p.id !== playerId);

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

        {/* Other players */}
        <div style={{
          display: 'flex',
          gap: 12,
          padding: '16px 24px',
          overflowX: 'auto',
          flexShrink: 0,
          scrollbarWidth: 'none',
          animation: 'slideInDown 0.6s ease-out 0.1s backwards',
        }}>
          {otherPlayers.map((p, i) => {
            const isActive = players[currentPlayerIndex]?.id === p.id;
            return (
              <div
                key={p.id}
                style={{
                  background: isActive
                    ? 'rgba(255,165,2,0.12)'
                    : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${
                    isActive
                      ? 'rgba(255,165,2,0.3)'
                      : 'rgba(255,255,255,0.08)'
                  }`,
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexShrink: 0,
                  boxShadow: isActive
                    ? '0 0 16px rgba(255,165,2,0.2)'
                    : 'none',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ display: 'flex', gap: 1 }}>
                  {Array.from({ length: Math.min(p.cardCount, 8) }).map(
                    (_, j) => (
                      <div
                        key={j}
                        style={{
                          width: 13,
                          height: 20,
                          borderRadius: 2,
                          background:
                            'linear-gradient(135deg, rgba(100,100,120,0.8), rgba(60,60,80,0.8))',
                          border: '0.5px solid rgba(255,255,255,0.1)',
                          marginLeft: j > 0 ? -4 : 0,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        }}
                      />
                    )
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "'Poppins',sans-serif",
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.45)',
                      fontFamily: "'Poppins',sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {p.cardCount} card{p.cardCount !== 1 ? 's' : ''}{' '}
                    {p.saidUno && (
                      <span style={{ color: '#ff4757', fontWeight: 700 }}>
                        🔴 UNO!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center play area */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 48,
          padding: '16px 24px',
          minHeight: 0,
        }}>
          {/* Draw pile */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              onClick={handleDraw}
              style={{
                width: 80,
                height: 120,
                background: 'linear-gradient(135deg, #ff4757 25%, #ff6348 100%)',
                borderRadius: 10,
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
                flexShrink: 0,
                opacity: isMyTurn ? 1 : 0.6,
                animation: drawnCard ? 'drawShake 0.5s ease-in-out' : 'none',
              }}
              onMouseEnter={e => {
                if (isMyTurn) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow =
                    '0 0 36px rgba(255,71,87,0.6)';
                }
              }}
              onMouseLeave={e => {
                if (isMyTurn) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 0 28px rgba(255,71,87,0.5)';
                }
              }}
            >
              <span style={{ fontSize: 32, opacity: 0.9 }}>🂠</span>
            </div>
            <span
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.45)',
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              {deckCount} LEFT
            </span>
          </div>

          {/* Top card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              animation: cardPlayed ? 'topCardFlash 0.4s ease-out' : 'none',
            }}
          >
            {topCard && (
              <UnoCard
                card={{
                  ...topCard,
                  color:
                    topCard.color === 'wild'
                      ? topCard.chosenColor || 'wild'
                      : topCard.color,
                  chosenColor: topCard.chosenColor,
                }}
              />
            )}
            {/* Current color indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 20,
                padding: '6px 14px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  background: COLOR_MAP[currentColor] || '#fff',
                  boxShadow: `0 0 10px ${COLOR_MAP[currentColor] || '#fff'}`,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "'Poppins',sans-serif",
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                {currentColor?.toUpperCase()}
              </span>
            </div>
          </div>
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
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              background: 'rgba(20,20,40,0.95)',
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
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
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
      `}</style>
    </div>
  );
}
