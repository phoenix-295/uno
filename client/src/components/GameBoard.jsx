import React, { useState } from 'react';
import UnoCard from './UnoCard';

const COLOR_MAP = {
  red: '#ff3366',
  green: '#00f5a0',
  blue: '#00c6ff',
  yellow: '#ffcc00',
  wild: '#a855f7',
};

const COLORS = ['red', 'green', 'blue', 'yellow'];
const COLOR_DOT = ['var(--color-red-start, #ff3366)', 'var(--color-green-start, #00f5a0)', 'var(--color-blue-start, #00c6ff)', 'var(--color-yellow-start, #ffcc00)', '#9b5de5', '#ff6b9d', '#00d2d3', '#ffcc00'];

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
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem('uno_muted') === 'true';
    } catch {
      return false;
    }
  });

  if (!gameState) return null;

  const { hand, topCard, currentColor, players, currentPlayerIndex, status, winner, log, deckCount, timeRemaining, drawPending, stackDraw2 } = gameState;
  const me = players.find(p => p.id === playerId);
  const isMyTurn = me && players[currentPlayerIndex]?.id === playerId;

  const toggleMute = () => {
    setMuted(prev => {
      const newVal = !prev;
      try {
        localStorage.setItem('uno_muted', String(newVal));
      } catch {}
      return newVal;
    });
  };

  const playSynthesizedSound = (type) => {
    if (muted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === 'play') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } else if (type === 'draw') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.21);
      } else if (type === 'turn') {
        const now = ctx.currentTime;
        [523.25, 659.25].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0, now);
          gain.gain.setValueAtTime(0.08, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.26);
        });
      } else if (type === 'uno') {
        const now = ctx.currentTime;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        // Energetic retro-game fanfare shout using sawtooth (bright, buzzy, scream-like) oscillators
        [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.25, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.65);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.67);
        });
      } else if (type === 'danger') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      }
    } catch (e) {
      console.warn('Audio Context block:', e);
    }
  };

  // Trigger animation & turn sound when it becomes your turn
  React.useEffect(() => {
    if (isMyTurn && !isYourTurnNew) {
      setIsYourTurnNew(true);
      playSynthesizedSound('turn');
      setTimeout(() => setIsYourTurnNew(false), 800);
    }
  }, [isMyTurn]);

  // Monitor logs to trigger dynamic sounds
  React.useEffect(() => {
    if (log && log.length > 0) {
      const lastLog = log[log.length - 1];
      if (lastLog.includes('UNO!')) {
        playSynthesizedSound('uno');
      } else if (lastLog.includes('draws') || lastLog.includes('Draw')) {
        playSynthesizedSound('draw');
      } else if (lastLog.includes('plays') || lastLog.includes('play')) {
        playSynthesizedSound('play');
      }
    }
  }, [log?.length]);

  const isDangerTime = timeRemaining !== null && timeRemaining <= 3;

  // Danger heart-beat sound
  React.useEffect(() => {
    if (isDangerTime && isMyTurn) {
      playSynthesizedSound('danger');
    }
  }, [timeRemaining, isDangerTime, isMyTurn]);

  // Listen for drawn card that can be played
  React.useEffect(() => {
    const handleCardDrawn = ({ card, message }) => {
      setPlayableDrawnCard(card);
      setDrawnCardMessage(message);
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
    if (stackDraw2 && drawPending > 0) return card.value === 'draw2';
    if (card.value === 'wild' || card.value === 'wild4') return true;
    if (card.color === currentColor) return true;
    if (topCard && card.value === topCard.value) return true;
    return false;
  };

  const hasNoPlayableCards = isMyTurn && hand && !hand.some(card => canPlayCard(card));

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
      setPlayableDrawnCard(null);
      setDrawnCardMessage('');
      socket.emit('card:play', { cardId: card.id });
      setSelectedCard(null);
    }
  };

  const handleColorChoice = (color) => {
    setCardPlayed(pendingWild.id);
    setTimeout(() => setCardPlayed(null), 600);
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

  const getPlayerHandPoints = (playerHand) => {
    let pts = 0;
    if (!playerHand) return 0;
    for (const card of playerHand) {
      if (card.value === 'wild' || card.value === 'wild4') {
        pts += 50;
      } else if (card.value === 'skip' || card.value === 'reverse' || card.value === 'draw2') {
        pts += 20;
      } else {
        const val = parseInt(card.value, 10);
        if (!isNaN(val)) pts += val;
      }
    }
    return pts;
  };

  // Winner/Game Finished Screen
  if (status === 'finished') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at center, #0e122b 0%, #060814 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        padding: 24,
        position: 'relative',
        overflow: 'auto',
      }}>
        {/* Celebrating confetti particles */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: Math.random() * 8 + 6,
                height: Math.random() * 8 + 6,
                background: ['#ff3366', '#00f5a0', '#00c6ff', '#f7b733', '#a855f7'][i % 5],
                left: Math.random() * 100 + '%',
                top: '-10px',
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animation: `fall ${Math.random() * 2 + 3}s linear forwards`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>

        <div style={{
          textAlign: 'center',
          zIndex: 10,
          animation: 'scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          maxWidth: 500,
          width: '100%',
          padding: '20px 0'
        }}>
          <div style={{ fontSize: 84, marginBottom: 12, animation: 'float 5s ease-in-out infinite' }}>
            🏆
          </div>
          <h1 style={{
            fontSize: 48,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 8px',
            fontFamily: "'Space Grotesk', sans-serif"
          }}>
            {winner?.id === playerId ? 'VICTORY!' : `${winner?.name.toUpperCase()} WINS!`}
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 15,
            marginBottom: 28,
          }}>
            {winner?.id === playerId ? 'You dominated the nebula table. Perfect play! ✨' : 'Better luck in the next match! 💪'}
          </p>

          {/* Scorecard Table */}
          {gameState.winnerScore !== undefined && (
            <div className="glass-panel" style={{
              padding: '20px 24px',
              borderRadius: 16,
              marginBottom: 28,
              textAlign: 'left',
              width: '100%',
            }}>
              <div style={{
                fontSize: 11,
                letterSpacing: 2,
                color: 'var(--text-secondary)',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: 14,
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span>SCOREBOARD</span>
                <span style={{ color: 'var(--accent)' }}>Winner Total: {gameState.winnerScore} PTS</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {players.map((p) => {
                  const pHand = gameState.allHands ? gameState.allHands[p.id] : [];
                  const pPoints = getPlayerHandPoints(pHand);
                  const isWinner = p.id === winner?.id;
                  const lobbyPlayer = lobbyState?.players?.find(lp => lp.id === p.id);
                  const accumulatedScore = lobbyPlayer?.score || 0;

                  return (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: isWinner ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                        border: isWinner ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.04)',
                        borderRadius: 12,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, marginRight: 16 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                          {p.name} {isWinner && '👑'} <span style={{ color: 'var(--color-yellow-start, #ffcc00)', fontSize: 10, fontWeight: 700, marginLeft: 6 }}>({accumulatedScore} Room PTS)</span>
                        </span>
                        
                        {/* Display remaining hand cards as tiny badges */}
                        {!isWinner && pHand && pHand.length > 0 && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                            {pHand.map((c, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: 9,
                                  fontWeight: 800,
                                  padding: '1px 5px',
                                  borderRadius: 4,
                                  background: c.color === 'wild' ? 'linear-gradient(135deg, #181922 0%, #0b0c10 100%)' : COLOR_MAP[c.color] || '#333',
                                  color: '#fff',
                                }}
                              >
                                {c.value === 'wild' ? '🌈' : c.value === 'wild4' ? '+4🌈' : c.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span style={{
                        fontFamily: "'Fira Code', monospace",
                        fontSize: 12,
                        fontWeight: 700,
                        color: isWinner ? 'var(--accent)' : 'var(--text-secondary)',
                      }}>
                        {isWinner ? 'Winner' : `+${pPoints} PTS`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={() => socket.emit('game:restart')}
            className="btn-primary"
            style={{ width: '100%', padding: '15px' }}
          >
            PLAY AGAIN
          </button>
        </div>

        <style>{`
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
      background: 'radial-gradient(circle at center, #16161a 0%, #000000 100%)',
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: isDangerTime && isMyTurn ? 'inset 0 0 45px rgba(239, 68, 68, 0.45)' : 'none',
      transition: 'box-shadow 0.4s ease, background 0.5s ease',
    }}>
      {/* Background elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: 400,
        height: 400,
        background: `radial-gradient(circle, ${COLOR_MAP[currentColor]}15 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        transition: 'background 0.5s ease',
      }} />

      {/* Stack banner */}
      {stackDraw2 && drawPending > 0 && (
        <div style={{
          position: 'fixed',
          top: 76,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, var(--color-red-start) 0%, var(--color-red-end) 100%)',
          color: '#fff',
          padding: '10px 24px',
          borderRadius: 14,
          zIndex: 998,
          boxShadow: '0 8px 24px rgba(255, 51, 102, 0.4)',
          fontWeight: 700,
          fontSize: 13,
          animation: 'slideDown 0.4s ease-out',
        }}>
          🔥 STACK PENDING: {drawPending} CARDS! {isMyTurn ? 'Play +2 or DRAW!' : `${currentPlayerObj?.name} is thinking...`}
        </div>
      )}

      {/* Playable drawn card notification */}
      {!drawPending && playableDrawnCard && (
        <div style={{
          position: 'fixed',
          top: 76,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, var(--color-green-start) 0%, var(--color-green-end) 100%)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: 14,
          zIndex: 998,
          boxShadow: '0 8px 24px rgba(0, 245, 160, 0.3)',
          fontWeight: 700,
          fontSize: 13,
          animation: 'slideDown 0.4s ease-out',
        }}>
          {drawnCardMessage}
        </div>
      )}

      {/* Header Info Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        background: 'rgba(6, 8, 20, 0.65)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        zIndex: 100,
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>ROOM</span>
            <span style={{
              fontFamily: "'Fira Code', monospace",
              fontWeight: 800,
              color: 'var(--accent)',
              fontSize: 14,
              letterSpacing: 2,
              background: 'rgba(99, 102, 241, 0.1)',
              padding: '3px 8px',
              borderRadius: 6,
            }}>
              {roomId}
            </span>
          </div>

          <button
            onClick={toggleMute}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
              borderRadius: 10,
              padding: '5px 12px',
              cursor: 'pointer',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 700,
              letterSpacing: 0.5,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
          >
            {muted ? '🔈 MUTED' : '🔊 SOUNDS'}
          </button>
        </div>

        {/* Turn indicator badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: isMyTurn ? '0 0 16px var(--accent-glow)' : 'none',
          animation: isMyTurn ? 'turnGlow 2s ease-in-out infinite' : 'none',
        }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: COLOR_MAP[currentColor] || '#fff',
            boxShadow: `0 0 10px ${COLOR_MAP[currentColor] || '#fff'}`,
          }} />
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: isMyTurn ? 'var(--accent)' : 'var(--text-primary)',
          }}>
            {isMyTurn ? '⚡ YOUR TURN' : `${currentPlayerObj?.name.toUpperCase()}'S TURN`}
          </span>
          {timeRemaining !== null && (
            <span style={{
              marginLeft: 8,
              fontSize: 11,
              fontWeight: 800,
              fontFamily: "'Fira Code', monospace",
              color: timeRemaining <= 3 ? '#ef4444' : timeRemaining <= 5 ? '#f59e0b' : '#10b981',
            }}>
              {timeRemaining}s
            </span>
          )}
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
          {gameState.direction === 1 ? '↻ Clockwise' : '↺ Counter-Clockwise'}
        </div>
      </div>

      {/* Main Play Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0 }}>
        
        {/* Arena Table */}
        <div style={{ flex: 1, position: 'relative', overflow: 'visible', margin: '24px 0' }}>
          
          {/* Neon Central Circular felt */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 320,
            height: 320,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(30, 30, 35, 0.6) 0%, rgba(10, 10, 12, 0.4) 100%)',
            border: '2px solid rgba(255, 255, 255, 0.03)',
            boxShadow: `0 0 40px rgba(0,0,0,0.5), inset 0 0 32px ${COLOR_MAP[currentColor]}15`,
            transition: 'all 0.5s ease',
          }} />

          {/* Direction indicator circular glow ring */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 350,
            height: 350,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: `1.5px dashed ${COLOR_MAP[currentColor]}22`,
            animation: `spin ${gameState.direction === 1 ? '16s' : '16s reverse'} linear infinite`,
            pointerEvents: 'none',
            transition: 'border-color 0.5s ease',
          }} />

          {/* Draw pile + Top played card container */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            zIndex: 10,
          }}>
            {/* Draw Deck Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative', width: 80, height: 120 }}>
                {/* 3D layers beneath the deck */}
                <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: '#090514', transform: 'translate(4px, 4px)', border: '1px solid rgba(255,255,255,0.03)' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: '#1e1b4b', transform: 'translate(2px, 2px)', border: '1px solid rgba(255,255,255,0.05)' }} />
                {hasNoPlayableCards && (
                  <div style={{
                    position: 'absolute',
                    inset: -8,
                    borderRadius: 18,
                    border: '3px solid var(--color-yellow-start)',
                    boxShadow: '0 0 20px var(--color-yellow-glow)',
                    pointerEvents: 'none',
                    animation: 'drawHighlightPulse 1.5s infinite',
                    zIndex: 6,
                  }} />
                )}
                <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
                  <UnoCard
                    isBack={true}
                    onClick={handleDraw}
                    playable={isMyTurn}
                  />
                </div>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: "'Fira Code', monospace", fontWeight: 700 }}>
                {deckCount} DECK
              </span>
            </div>

            {/* Discard Pile Top Card */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              {topCard && (
                <div style={{
                  animation: cardPlayed ? 'topCardFlash 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
                  filter: `drop-shadow(0 4px 16px ${COLOR_MAP[topCard.color === 'wild' ? topCard.chosenColor || 'wild' : topCard.color]}44)`
                }}>
                  <UnoCard
                    card={{
                      ...topCard,
                      color: topCard.color === 'wild' ? topCard.chosenColor || 'wild' : topCard.color,
                      chosenColor: topCard.chosenColor,
                    }}
                  />
                </div>
              )}
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: 0.5 }}>
                DISCARD
              </span>
            </div>
          </div>

          {/* Players arranged circularly around the table */}
          {players.map((p, i) => {
            const N = players.length;
            const myIdx = players.findIndex(pl => pl.id === playerId);
            const offset = (i - myIdx + N) % N;
            // Shift coordinate system so current user is always placed at the bottom
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
                  gap: 6,
                  zIndex: 30,
                  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                }}
              >
                {/* Turn badge banner */}
                <div style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  color: isCurrent ? 'var(--accent)' : isNext ? 'var(--text-secondary)' : 'transparent',
                  background: isCurrent ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: isCurrent ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                  minWidth: 70,
                  textAlign: 'center',
                  pointerEvents: 'none',
                  transition: 'all 0.4s ease',
                }}>
                  {isCurrent ? 'THINKING' : isNext ? 'NEXT' : '\u00A0'}
                </div>

                {/* Avatar sphere */}
                <div style={{
                  position: 'relative',
                  width: isCurrent ? 56 : 46,
                  height: isCurrent ? 56 : 46,
                  transition: 'all 0.3s ease',
                }}>
                  {isCurrent && timeRemaining !== null && (
                    <svg
                      style={{
                        position: 'absolute',
                        top: -6,
                        left: -6,
                        width: 68,
                        height: 68,
                        transform: 'rotate(-90deg)',
                        zIndex: 1,
                        pointerEvents: 'none'
                      }}
                    >
                      <circle
                        cx={34}
                        cy={34}
                        r={30}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="3"
                        fill="none"
                      />
                      <circle
                        cx={34}
                        cy={34}
                        r={30}
                        stroke={timeRemaining <= 3 ? 'var(--color-red-start)' : timeRemaining <= 5 ? 'var(--color-yellow-start)' : 'var(--color-green-start)'}
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 30}`}
                        strokeDashoffset={`${2 * Math.PI * 30 * (1 - timeRemaining / (lobbyState?.turnTimeLimit || 10))}`}
                        style={{
                          transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease',
                        }}
                      />
                    </svg>
                  )}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: COLOR_DOT[i % COLOR_DOT.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isCurrent ? 18 : 15,
                    fontWeight: 900,
                    color: '#060814',
                    border: isCurrent
                      ? '3.5px solid #fff'
                      : isNext
                        ? '2px solid var(--accent)'
                        : '2.5px solid rgba(255,255,255,0.1)',
                    boxShadow: isCurrent
                      ? `0 0 24px ${COLOR_DOT[i % COLOR_DOT.length]}aa`
                      : `0 4px 12px rgba(0,0,0,0.4)`,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 2,
                  }}>
                    {p.name[0].toUpperCase()}
                  </div>
                </div>

                {/* Name tag and statistics */}
                <div style={{
                  background: 'rgba(18, 22, 47, 0.85)',
                  border: `1.5px solid ${isCurrent ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 10,
                  padding: '4px 12px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    maxWidth: 100,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {p.name}{isMe ? ' (you)' : ''}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: 'var(--text-secondary)',
                    marginTop: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4
                  }}>
                    <span>🎴 {p.cardCount}</span>
                    {p.saidUno && (
                      <span style={{
                        color: 'var(--color-red-start)',
                        fontWeight: 900,
                        fontSize: 9,
                        letterSpacing: 0.5,
                        background: 'rgba(255, 51, 102, 0.1)',
                        padding: '1px 4px',
                        borderRadius: 4,
                      }}>
                        UNO
                      </span>
                    )}
                  </div>
                </div>

                {/* Catch UNO penalty trigger button */}
                {p.id !== playerId && p.cardCount === 1 && !p.saidUno && (
                  <button
                    onClick={() => socket.emit('uno:catch', { targetId: p.id })}
                    style={{
                      marginTop: 4,
                      padding: '4px 10px',
                      background: 'linear-gradient(135deg, var(--color-red-start) 0%, var(--color-red-end) 100%)',
                      border: 'none',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(255, 51, 102, 0.4)',
                      animation: 'catchPulse 1.2s ease-in-out infinite',
                    }}
                  >
                    💥 CATCH!
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Dynamic Log history alerts */}
        <div style={{
          padding: '12px 32px',
          flexShrink: 0,
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {[...log].reverse().slice(0, 4).map((l, i) => {
            let logColor = 'var(--text-secondary)';
            let logBg = 'rgba(255, 255, 255, 0.01)';
            let logBorder = 'rgba(255, 255, 255, 0.05)';
            
            if (l.includes('plays') || l.includes('play')) {
              logColor = 'var(--color-green-start)';
              logBg = 'rgba(0, 245, 160, 0.05)';
              logBorder = 'rgba(0, 245, 160, 0.15)';
            } else if (l.includes('draws') || l.includes('too long') || l.includes('penalty') || l.includes('Draw')) {
              logColor = 'var(--color-red-start)';
              logBg = 'rgba(255, 51, 102, 0.05)';
              logBorder = 'rgba(255, 51, 102, 0.15)';
            } else if (l.includes('UNO!')) {
              logColor = 'var(--color-yellow-start)';
              logBg = 'rgba(247, 183, 51, 0.08)';
              logBorder = 'rgba(247, 183, 51, 0.2)';
            }

            return (
              <div
                key={i}
                className="glass-panel"
                style={{
                  padding: '6px 16px',
                  borderRadius: 10,
                  fontSize: 11,
                  color: i === 0 ? logColor : 'var(--text-secondary)',
                  border: i === 0 ? `1px solid ${logBorder}` : '1px solid rgba(255, 255, 255, 0.05)',
                  background: i === 0 ? logBg : 'rgba(255, 255, 255, 0.01)',
                  fontWeight: i === 0 ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {l}
              </div>
            );
          })}
        </div>

        {/* Player hand console */}
        <div style={{
          padding: '20px 32px 32px',
          background: 'rgba(6, 8, 20, 0.8)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(20px)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div style={{
              fontSize: 11,
              letterSpacing: 2,
              color: 'var(--text-secondary)',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}>
              YOUR HAND ({hand?.length || 0})
            </div>
            
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => socket.emit('cards:sort')}
                className="btn-secondary"
                style={{ padding: '6px 18px', fontSize: 12, borderRadius: 10 }}
              >
                🔀 SORT
              </button>
              {hand?.length === 1 && (
                <button
                  onClick={handleUno}
                  className="btn-primary"
                  style={{
                    padding: '6px 20px',
                    fontSize: 12,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--color-red-start) 0%, var(--color-red-end) 100%)',
                    boxShadow: '0 0 16px rgba(255, 51, 102, 0.5)',
                  }}
                >
                  📣 UNO!
                </button>
              )}
            </div>
          </div>

          {/* Hand Cards List */}
          <div style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 12,
            minHeight: 140,
            alignItems: 'flex-end',
          }}>
            {(hand || []).map((card) => (
              <div
                key={card.id}
                style={{
                  animation: cardPlayed === card.id ? 'cardFly 0.6s ease-in-out forwards' : 'none',
                  position: 'relative'
                }}
              >
                {/* Highlight playability glow outline */}
                {playableDrawnCard && card.id === playableDrawnCard.id && (
                  <div style={{
                    position: 'absolute',
                    inset: -6,
                    borderRadius: 16,
                    border: '2px solid var(--color-green-start)',
                    boxShadow: '0 0 14px var(--color-green-glow)',
                    pointerEvents: 'none',
                    animation: 'pulse-border 1.5s infinite',
                  }} />
                )}
                <UnoCard
                  card={card}
                  onClick={() => handleCardClick(card)}
                  selected={selectedCard === card.id}
                  playable={isMyTurn && canPlayCard(card)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Color picker modal overlay */}
      {showColorPicker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(6, 8, 20, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div className="glass-panel" style={{
            padding: '40px 48px',
            textAlign: 'center',
            maxWidth: 420,
            width: '100%'
          }}>
            <div style={{
              marginBottom: 24,
              fontSize: 16,
              letterSpacing: 2,
              fontWeight: 800,
              color: '#fff',
            }}>
              SELECT WILD COLOR
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => handleColorChoice(c)}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: COLOR_MAP[c],
                    border: '3px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    boxShadow: `0 6px 20px ${COLOR_MAP[c]}44`,
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.15) translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 12px 30px ${COLOR_MAP[c]}77`;
                    e.currentTarget.style.borderColor = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.style.boxShadow = `0 6px 20px ${COLOR_MAP[c]}44`;
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes catchPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(255, 51, 102, 0.4); }
          50% { transform: scale(1.06); box-shadow: 0 6px 20px rgba(255, 51, 102, 0.7); }
        }
        @keyframes cardFly {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(-300px) rotate(45deg) scale(0.4); }
        }
        @keyframes drawHighlightPulse {
          0%, 100% { box-shadow: 0 0 16px var(--color-yellow-glow); border-color: var(--color-yellow-start); }
          50% { box-shadow: 0 0 32px var(--color-yellow-glow), 0 0 8px #fff; border-color: #fff; }
        }
      `}</style>
    </div>
  );
}
