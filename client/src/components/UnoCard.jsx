import React from 'react';

const GRADIENTS = {
  red: 'linear-gradient(135deg, var(--color-red-start, #ff3366) 0%, var(--color-red-end, #ff5e62) 100%)',
  green: 'linear-gradient(135deg, var(--color-green-start, #00f5a0) 0%, var(--color-green-end, #00d9f5) 100%)',
  blue: 'linear-gradient(135deg, var(--color-blue-start, #00c6ff) 0%, var(--color-blue-end, #0072ff) 100%)',
  yellow: 'linear-gradient(135deg, var(--color-yellow-start, #ffea79) 0%, var(--color-yellow-end, #ffcc00) 100%)',
  wild: 'linear-gradient(135deg, #181922 0%, #0b0c10 100%)',
  back: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)'
};

const GLOWS = {
  red: 'var(--color-red-glow, rgba(255, 51, 102, 0.45))',
  green: 'var(--color-green-glow, rgba(0, 245, 160, 0.4))',
  blue: 'var(--color-blue-glow, rgba(0, 198, 255, 0.45))',
  yellow: 'var(--color-yellow-glow, rgba(247, 183, 51, 0.45))',
  wild: 'var(--color-wild-glow, rgba(139, 92, 246, 0.5))',
  back: 'rgba(99, 102, 241, 0.25)'
};

const VALUE_DISPLAY = {
  skip: '⊘',
  reverse: '⇄',
  draw2: '+2',
  wild: 'WILD',
  wild4: '+4',
};

export default function UnoCard({ card, onClick, selected, playable, small, isYourTurn, isBack }) {
  const cardColor = isBack ? 'back' : card?.color || 'wild';
  const displayValue = isBack ? '' : VALUE_DISPLAY[card?.value] || card?.value || '';
  const isSpecial = !isBack && !!VALUE_DISPLAY[card?.value];

  // Set card dimensions
  const width = small ? 50 : 80;
  const height = small ? 72 : 120;
  const fontSize = small ? 14 : 26;
  const cornerFont = small ? 10 : 14;

  const gradient = GRADIENTS[cardColor] || GRADIENTS.wild;
  const glow = GLOWS[cardColor] || GLOWS.wild;

  // Render Card Back
  if (isBack) {
    return (
      <div
        onClick={onClick}
        style={{
          width,
          height,
          background: gradient,
          borderRadius: 14,
          border: '1.5px solid rgba(99, 102, 241, 0.35)',
          boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 16px ${glow}`,
          cursor: onClick ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          flexShrink: 0,
          userSelect: 'none',
          overflow: 'hidden'
        }}
        onMouseEnter={e => {
          if (onClick) {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
            e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.5), 0 0 24px var(--accent-glow)`;
          }
        }}
        onMouseLeave={e => {
          if (onClick) {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.4), 0 0 16px ${glow}`;
          }
        }}
      >
        {/* Futuristic geometric pattern */}
        <div style={{
          position: 'absolute',
          inset: 4,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 10,
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Inner accent ring */}
          <div style={{
            width: '80%',
            height: '80%',
            borderRadius: '50%',
            border: '1px dashed rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: small ? 11 : 18,
              letterSpacing: 1,
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 8px rgba(99, 102, 241, 0.3)'
            }}>
              UNO
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        width,
        height,
        background: gradient,
        borderRadius: 14,
        border: selected
          ? '3px solid #fff'
          : '1px solid rgba(255,255,255,0.2)',
        boxShadow: selected
          ? `0 0 28px 8px ${glow}, 0 8px 24px rgba(0,0,0,0.4)`
          : playable
          ? `0 6px 18px ${glow}`
          : `0 4px 10px rgba(0,0,0,0.3)`,
        cursor: onClick ? (playable ? 'pointer' : 'not-allowed') : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transform: selected
          ? 'translateY(-14px) scale(1.05)'
          : playable
          ? 'translateY(-4px)'
          : 'none',
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        opacity: onClick && !playable ? 0.45 : 1,
        flexShrink: 0,
        userSelect: 'none',
        overflow: 'hidden'
      }}
      onMouseEnter={e => {
        if (playable && onClick) {
          e.currentTarget.style.transform = 'translateY(-12px) scale(1.06)';
          e.currentTarget.style.boxShadow = `0 0 32px 10px ${glow}, 0 12px 28px rgba(0,0,0,0.4)`;
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = selected
          ? 'translateY(-14px) scale(1.05)'
          : playable
          ? 'translateY(-4px)'
          : 'none';
        e.currentTarget.style.boxShadow = selected
          ? `0 0 28px 8px ${glow}, 0 8px 24px rgba(0,0,0,0.4)`
          : playable
          ? `0 6px 18px ${glow}`
          : `0 4px 10px rgba(0,0,0,0.3)`;
      }}
    >
      {/* Gloss overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Oval Center Badge */}
      <div
        style={{
          width: '74%',
          height: '74%',
          background: card?.color === 'wild'
            ? 'linear-gradient(135deg, var(--color-red-start, #ff3366) 0%, var(--color-yellow-end, #ffcc00) 35%, var(--color-green-start, #00f5a0) 65%, var(--color-blue-start, #00c6ff) 100%)'
            : 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(4px)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1.5px solid rgba(255,255,255,0.18)',
          boxShadow: 'inset 0 0 12px rgba(0,0,0,0.15)',
        }}
      >
        <span
          style={{
            color: '#fff',
            fontSize: isSpecial && !small ? fontSize * 0.75 : fontSize,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            letterSpacing: isSpecial ? -0.5 : 0,
          }}
        >
          {displayValue}
        </span>
      </div>

      {/* Top Left Label */}
      <span
        style={{
          position: 'absolute',
          top: 6,
          left: 8,
          color: '#fff',
          fontSize: cornerFont,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800,
          opacity: 0.9,
          textShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      >
        {displayValue}
      </span>

      {/* Bottom Right Label (Rotated) */}
      <span
        style={{
          position: 'absolute',
          bottom: 6,
          right: 8,
          color: '#fff',
          fontSize: cornerFont,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800,
          opacity: 0.9,
          transform: 'rotate(180deg)',
          textShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      >
        {displayValue}
      </span>

      {/* Wild color ring indicators */}
      {card?.color === 'wild' && card?.chosenColor && (
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            left: 8,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: GRADIENTS[card.chosenColor] || '#fff',
            border: '1.5px solid #fff',
            boxShadow: `0 0 8px ${GLOWS[card.chosenColor]}`
          }}
        />
      )}
    </div>
  );
}
