import React from 'react';

const COLOR_MAP = {
  red: { bg: '#e63946', text: '#fff', shadow: '#c1121f' },
  green: { bg: '#2d9e5f', text: '#fff', shadow: '#1a7a45' },
  blue: { bg: '#1d7bbf', text: '#fff', shadow: '#0d5a8f' },
  yellow: { bg: '#f4c430', text: '#1a1a1a', shadow: '#c9940a' },
  wild: { bg: '#1a1a2e', text: '#fff', shadow: '#000' },
};

const VALUE_DISPLAY = {
  skip: '⊘',
  reverse: '↻',
  draw2: '+2',
  wild: '🌈',
  wild4: '+4',
};

export default function UnoCard({ card, onClick, selected, playable, small }) {
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
        borderRadius: 8,
        border: selected ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)',
        boxShadow: selected
          ? `0 0 18px 4px ${colors.bg}, 0 4px 12px ${colors.shadow}`
          : `0 3px 8px ${colors.shadow}88`,
        cursor: onClick ? (playable ? 'pointer' : 'not-allowed') : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transform: selected ? 'translateY(-12px)' : playable ? 'translateY(-4px)' : 'none',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        opacity: onClick && !playable ? 0.55 : 1,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Oval center */}
      <div style={{
        width: '72%', height: '75%',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid rgba(255,255,255,0.3)',
      }}>
        <span style={{
          color: colors.text,
          fontSize: size.fontSize,
          fontFamily: "'Righteous', cursive",
          fontWeight: 700,
          textShadow: '1px 1px 3px rgba(0,0,0,0.4)',
          letterSpacing: isSpecial ? 0 : 1,
        }}>
          {displayValue.toUpperCase()}
        </span>
      </div>

      {/* Corner labels */}
      <span style={{
        position: 'absolute', top: 3, left: 5,
        color: colors.text, fontSize: size.cornerFont,
        fontFamily: "'Righteous', cursive", fontWeight: 700, opacity: 0.9,
        lineHeight: 1,
      }}>{displayValue}</span>
      <span style={{
        position: 'absolute', bottom: 3, right: 5,
        color: colors.text, fontSize: size.cornerFont,
        fontFamily: "'Righteous', cursive", fontWeight: 700, opacity: 0.9,
        lineHeight: 1, transform: 'rotate(180deg)',
      }}>{displayValue}</span>

      {/* Wild color ring */}
      {card.color === 'wild' && card.chosenColor && (
        <div style={{
          position: 'absolute', bottom: -4, right: -4,
          width: 14, height: 14, borderRadius: '50%',
          background: COLOR_MAP[card.chosenColor]?.bg || '#fff',
          border: '2px solid rgba(255,255,255,0.7)',
        }} />
      )}
    </div>
  );
}
