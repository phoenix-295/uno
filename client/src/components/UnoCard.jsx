import React from 'react';

const COLOR_MAP = {
  red: { bg: '#ff4757', text: '#fff', shadow: '#ff6348' },
  green: { bg: '#2ed573', text: '#fff', shadow: '#1ecc71' },
  blue: { bg: '#1e90ff', text: '#fff', shadow: '#0066ff' },
  yellow: { bg: '#ffa502', text: '#1a1a1a', shadow: '#ff8c00' },
  wild: { bg: '#1a1a2e', text: '#fff', shadow: '#000' },
};

const VALUE_DISPLAY = {
  skip: '⊘',
  reverse: '↻',
  draw2: '+2',
  wild: '🌈',
  wild4: '+4',
};

export default function UnoCard({ card, onClick, selected, playable, small, isYourTurn }) {
  const colors = COLOR_MAP[card.color] || COLOR_MAP.wild;
  const displayValue = VALUE_DISPLAY[card.value] || card.value;
  const isSpecial = !!VALUE_DISPLAY[card.value];

  const size = small
    ? { width: 44, height: 64, fontSize: 13, cornerFont: 9 }
    : { width: 72, height: 108, fontSize: 22, cornerFont: 12 };

  return (
    <div
      onClick={onClick}
      style={{
        width: size.width,
        height: size.height,
        background: colors.bg,
        borderRadius: 10,
        border: selected
          ? '3px solid #fff'
          : '2px solid rgba(255,255,255,0.15)',
        boxShadow: selected
          ? `0 0 24px 6px ${colors.bg}, 0 8px 16px ${colors.shadow}99`
          : playable
          ? `0 4px 16px ${colors.shadow}66`
          : `0 3px 8px ${colors.shadow}44`,
        cursor: onClick ? (playable ? 'pointer' : 'not-allowed') : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transform: selected
          ? 'translateY(-14px) scale(1.02)'
          : playable
          ? 'translateY(-6px)'
          : 'none',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
        opacity: onClick && !playable ? 0.5 : 1,
        flexShrink: 0,
        userSelect: 'none',
        animation: 'cardFlip 0.5s ease-out',
      }}
    >
      {/* Oval center */}
      <div
        style={{
          width: '72%',
          height: '75%',
          background: 'rgba(255,255,255,0.12)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(255,255,255,0.25)',
        }}
      >
        <span
          style={{
            color: colors.text,
            fontSize: size.fontSize,
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
            letterSpacing: isSpecial ? 0 : 2,
          }}
        >
          {displayValue.toUpperCase()}
        </span>
      </div>

      {/* Corner labels */}
      <span
        style={{
          position: 'absolute',
          top: 4,
          left: 6,
          color: colors.text,
          fontSize: size.cornerFont,
          fontFamily: "'Space Mono', monospace",
          fontWeight: 700,
          opacity: 0.85,
          lineHeight: 1,
          textShadow: '0.5px 0.5px 2px rgba(0,0,0,0.4)',
        }}
      >
        {displayValue}
      </span>
      <span
        style={{
          position: 'absolute',
          bottom: 4,
          right: 6,
          color: colors.text,
          fontSize: size.cornerFont,
          fontFamily: "'Space Mono', monospace",
          fontWeight: 700,
          opacity: 0.85,
          lineHeight: 1,
          transform: 'rotate(180deg)',
          textShadow: '0.5px 0.5px 2px rgba(0,0,0,0.4)',
        }}
      >
        {displayValue}
      </span>

      {/* Wild color ring */}
      {card.color === 'wild' && card.chosenColor && (
        <div
          style={{
            position: 'absolute',
            bottom: -5,
            right: -5,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: COLOR_MAP[card.chosenColor]?.bg || '#fff',
            border: '3px solid rgba(255,255,255,0.8)',
            boxShadow: `0 2px 8px ${COLOR_MAP[card.chosenColor]?.bg}88`,
            animation: 'spin 2s linear infinite',
          }}
        />
      )}

      <style>{`
        @keyframes cardFlip {
          from {
            opacity: 0;
            transform: rotateY(90deg) translateY(0);
          }
          to {
            opacity: 1;
            transform: rotateY(0deg) translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
