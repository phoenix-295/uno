import React, { useState } from 'react';
import UnoCard from './UnoCard';

const COLOR_MAP = {
  red: '#e63946', green: '#2d9e5f', blue: '#1d7bbf',
  yellow: '#f4c430', wild: '#1a1a2e',
};

const COLORS = ['red', 'green', 'blue', 'yellow'];

export default function GameBoard({ socket, gameState, playerId, lobbyState, roomId }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWild, setPendingWild] = useState(null);
  const [animDrawn, setAnimDrawn] = useState(false);

  if (!gameState) return null;

  const { hand, topCard, currentColor, players, currentPlayerIndex, status, winner, log, deckCount } = gameState;
  const me = players.find(p => p.id === playerId);
  const isMyTurn = me && players[currentPlayerIndex]?.id === playerId;

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
      socket.emit('card:play', { cardId: card.id });
      setSelectedCard(null);
    }
  };

  const handleColorChoice = (color) => {
    socket.emit('card:play', { cardId: pendingWild.id, chosenColor: color });
    setShowColorPicker(false);
    setPendingWild(null);
    setSelectedCard(null);
  };

  const handleDraw = () => {
    if (!isMyTurn) return;
    setAnimDrawn(true);
    socket.emit('card:draw');
    setTimeout(() => setAnimDrawn(false), 600);
  };

  const handleUno = () => socket.emit('uno:call');

  if (status === 'finished') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Righteous', cursive", color: '#fff', padding: 24,
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Righteous&family=Nunito:wght@400;600;800&display=swap" rel="stylesheet" />
        <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: 48, margin: '0 0 8px' }}>
          {winner?.id === playerId ? 'YOU WIN!' : `${winner?.name} WINS!`}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Nunito',sans-serif" }}>
          {winner?.id === playerId ? 'Congratulations! 🏆' : 'Better luck next time!'}
        </p>
        <button
          onClick={() => socket.emit('game:restart')}
          style={{
            marginTop: 32, padding: '14px 40px',
            background: 'linear-gradient(135deg, #e63946, #c1121f)',
            border: 'none', borderRadius: 12, color: '#fff',
            fontSize: 18, fontFamily: "'Righteous', cursive", cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(230,57,70,0.5)',
          }}
        >
          PLAY AGAIN
        </button>
      </div>
    );
  }

  const currentPlayerObj = players[currentPlayerIndex];
  const otherPlayers = players.filter(p => p.id !== playerId);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f0c29 0%, #1a1a3e 50%, #24243e 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Righteous', cursive", color: '#fff',
      overflow: 'hidden', position: 'relative',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Righteous&family=Nunito:wght@400;600;800&display=swap" rel="stylesheet" />

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
          ROOM <span style={{ color: '#f4c430' }}>{roomId}</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 16px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: COLOR_MAP[currentColor] || '#fff',
            boxShadow: `0 0 8px ${COLOR_MAP[currentColor] || '#fff'}`,
          }} />
          <span style={{ fontSize: 12, fontFamily: "'Nunito',sans-serif" }}>
            {isMyTurn ? '⚡ YOUR TURN' : `${currentPlayerObj?.name}'s turn`}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>
          {gameState.direction === 1 ? '→' : '←'} {players.length} players
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* Other players */}
        <div style={{
          display: 'flex', gap: 12, padding: '12px 20px',
          overflowX: 'auto', flexShrink: 0,
          scrollbarWidth: 'none',
        }}>
          {otherPlayers.map((p, i) => {
            const isActive = players[currentPlayerIndex]?.id === p.id;
            return (
              <div key={p.id} style={{
                background: isActive ? 'rgba(244,196,48,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isActive ? '#f4c430' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12, padding: '8px 16px',
                display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
                boxShadow: isActive ? '0 0 12px rgba(244,196,48,0.3)' : 'none',
                transition: 'all 0.3s',
              }}>
                <div style={{
                  display: 'flex', gap: -3,
                }}>
                  {Array.from({ length: Math.min(p.cardCount, 8) }).map((_, j) => (
                    <div key={j} style={{
                      width: 14, height: 22, borderRadius: 3,
                      background: 'linear-gradient(135deg, #555, #333)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      marginLeft: j > 0 ? -5 : 0,
                    }} />
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'Nunito',sans-serif" }}>
                    {p.cardCount} cards {p.saidUno ? '🔴 UNO!' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center play area */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 32, padding: '8px 20px', minHeight: 0,
        }}>
          {/* Draw pile */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div
              onClick={handleDraw}
              style={{
                width: 72, height: 108,
                background: 'linear-gradient(135deg, #e63946 25%, #c1121f 100%)',
                borderRadius: 8, border: '2px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isMyTurn ? 'pointer' : 'default',
                boxShadow: isMyTurn ? '0 0 20px rgba(230,57,70,0.6)' : '0 4px 12px rgba(0,0,0,0.4)',
                transform: animDrawn ? 'scale(0.95)' : 'none',
                transition: 'transform 0.15s, box-shadow 0.15s',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 28, opacity: 0.8 }}>🂠</span>
            </div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'Nunito',sans-serif" }}>
              {deckCount} left
            </span>
          </div>

          {/* Top card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {topCard && <UnoCard card={{ ...topCard, color: topCard.color === 'wild' ? (topCard.chosenColor || 'wild') : topCard.color, chosenColor: topCard.chosenColor }} />}
            {/* Current color indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: '4px 12px',
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: COLOR_MAP[currentColor] || '#fff',
              }} />
              <span style={{ fontSize: 10, fontFamily: "'Nunito',sans-serif", color: 'rgba(255,255,255,0.6)' }}>
                {currentColor?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Log */}
        <div style={{
          padding: '6px 20px', flexShrink: 0,
          display: 'flex', gap: 8, overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {[...log].reverse().slice(0, 4).map((l, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '4px 12px', flexShrink: 0,
              fontSize: 11, color: i === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
              fontFamily: "'Nunito',sans-serif",
            }}>
              {l}
            </div>
          ))}
        </div>

        {/* Player hand */}
        <div style={{
          padding: '12px 20px 20px',
          background: 'rgba(0,0,0,0.25)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
              YOUR HAND ({hand?.length || 0})
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {hand?.length === 1 && (
                <button
                  onClick={handleUno}
                  style={{
                    padding: '6px 20px',
                    background: 'linear-gradient(135deg, #e63946, #c1121f)',
                    border: 'none', borderRadius: 20, color: '#fff',
                    fontFamily: "'Righteous', cursive", fontSize: 14, cursor: 'pointer',
                    boxShadow: '0 0 16px rgba(230,57,70,0.6)',
                    animation: 'pulse 1s infinite',
                  }}
                >
                  UNO!
                </button>
              )}
            </div>
          </div>

          <div style={{
            display: 'flex', gap: 8, overflowX: 'auto',
            paddingBottom: 8, alignItems: 'flex-end',
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent',
          }}>
            {(hand || []).map(card => (
              <UnoCard
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card)}
                selected={selectedCard === card.id}
                playable={isMyTurn && canPlayCard(card)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Color picker modal */}
      {showColorPicker && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: 'rgba(20,20,40,0.95)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 20, padding: 32, textAlign: 'center',
          }}>
            <div style={{ marginBottom: 20, fontSize: 16, letterSpacing: 2 }}>CHOOSE COLOR</div>
            <div style={{ display: 'flex', gap: 16 }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => handleColorChoice(c)}
                  style={{
                    width: 64, height: 64, borderRadius: 12,
                    background: COLOR_MAP[c], border: 'none', cursor: 'pointer',
                    boxShadow: `0 4px 20px ${COLOR_MAP[c]}88`,
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 16px rgba(230,57,70,0.6); }
          50% { box-shadow: 0 0 28px rgba(230,57,70,0.9); }
        }
      `}</style>
    </div>
  );
}
