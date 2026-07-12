import React from 'react';

const CLASSIC_COLORS = {
  red: '#e01a22',
  green: '#2f9d44',
  blue: '#0066b2',
  yellow: '#ffcb05',
  wild: '#17181c',
  back: '#17181c',
};

const GLOWS = {
  red: 'rgba(224, 26, 34, 0.45)',
  green: 'rgba(47, 157, 68, 0.45)',
  blue: 'rgba(0, 102, 178, 0.45)',
  yellow: 'rgba(255, 203, 5, 0.45)',
  wild: 'rgba(255, 255, 255, 0.15)',
  back: 'rgba(224, 26, 34, 0.25)',
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
  const width = small ? 54 : 94;
  const height = small ? 80 : 140;
  const strokeWidth = small ? '1px' : '2px';
  const shadowOffset = small ? '1.5px' : '3px';

  // Render Card Back
  if (isBack) {
    return (
      <div
        onClick={onClick}
        style={{
          width,
          height,
          background: '#ffffff',
          borderRadius: 10,
          padding: small ? '3px' : '5px',
          border: '1px solid rgba(0,0,0,0.15)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          cursor: onClick ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.25s ease',
          flexShrink: 0,
          userSelect: 'none',
          overflow: 'hidden',
        }}
        onMouseEnter={e => {
          if (onClick) {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.6)';
          }
        }}
        onMouseLeave={e => {
          if (onClick) {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
          }
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          background: '#000000',
          borderRadius: 6,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Tilted Center Red Ellipse */}
          <div style={{
            position: 'absolute',
            top: '12%',
            left: '8%',
            width: '84%',
            height: '76%',
            background: '#e01a22',
            borderRadius: '50%',
            transform: 'rotate(-28deg) skewX(-6deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {/* "UNO" text tilted along with the oval */}
            <span style={{
              color: '#ffcb05',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: small ? 14 : 26,
              letterSpacing: -0.5,
              fontStyle: 'italic',
              WebkitTextStroke: strokeWidth,
              textShadow: `1px 1px 0px #000, 2px 2px 0px #fff, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000`,
            }}>
              UNO
            </span>
          </div>
        </div>
      </div>
    );
  }

  const baseColor = CLASSIC_COLORS[cardColor] || CLASSIC_COLORS.wild;
  const glow = GLOWS[cardColor] || GLOWS.wild;

  // Needs underline for 6 and 9
  const needsUnderline = !isSpecial && (displayValue === '6' || displayValue === '9');

  return (
    <div
      onClick={onClick}
      style={{
        width,
        height,
        background: '#ffffff', // Real cards have a solid white border!
        borderRadius: 10,
        padding: small ? '3px' : '5px',
        border: selected ? '3px solid var(--accent)' : '1px solid rgba(0,0,0,0.15)',
        boxShadow: selected
          ? `0 0 24px 6px ${glow}, 0 8px 24px rgba(0,0,0,0.6)`
          : playable
          ? `0 4px 14px ${glow}`
          : '0 4px 10px rgba(0,0,0,0.4)',
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
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (playable && onClick) {
          e.currentTarget.style.transform = 'translateY(-12px) scale(1.06)';
          e.currentTarget.style.boxShadow = `0 0 28px 8px ${glow}, 0 12px 28px rgba(0,0,0,0.6)`;
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = selected
          ? 'translateY(-14px) scale(1.05)'
          : playable
          ? 'translateY(-4px)'
          : 'none';
        e.currentTarget.style.boxShadow = selected
          ? `0 0 24px 6px ${glow}, 0 8px 24px rgba(0,0,0,0.6)`
          : playable
          ? `0 4px 14px ${glow}`
          : '0 4px 10px rgba(0,0,0,0.4)';
      }}
    >
      {/* Inner Card Face Wrapper */}
      <div style={{
        width: '100%',
        height: '100%',
        background: baseColor,
        borderRadius: 6,
        position: 'relative',
        overflow: 'hidden',
      }}>
        
        {/* Tilted Center Ellipse */}
        <div style={{
          position: 'absolute',
          top: '8%',
          left: '6%',
          width: '88%',
          height: '84%',
          background: '#ffffff',
          borderRadius: '50%',
          transform: 'rotate(-26deg) skewX(-8deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.1)',
        }}>
          {/* Content inside the tilted oval (counter-rotated to stay upright) */}
          <div style={{
            transform: 'rotate(26deg) skewX(8deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}>
            {/* Draw 4 Mini Cards Graphics */}
            {card?.value === 'wild4' ? (
              <div style={{
                position: 'relative',
                width: small ? '80%' : '75%',
                height: small ? '80%' : '75%',
              }}>
                {/* 4 Mini Cards overlapping */}
                <div style={{ position: 'absolute', width: '38%', height: '58%', borderRadius: 3, background: CLASSIC_COLORS.blue, border: '1px solid #000', left: '10%', top: '35%', transform: 'rotate(-12deg)' }} />
                <div style={{ position: 'absolute', width: '38%', height: '58%', borderRadius: 3, background: CLASSIC_COLORS.green, border: '1px solid #000', left: '26%', top: '15%', transform: 'rotate(5deg)' }} />
                <div style={{ position: 'absolute', width: '38%', height: '58%', borderRadius: 3, background: CLASSIC_COLORS.red, border: '1px solid #000', left: '46%', top: '22%', transform: 'rotate(20deg)' }} />
                <div style={{ position: 'absolute', width: '38%', height: '58%', borderRadius: 3, background: CLASSIC_COLORS.yellow, border: '1px solid #000', left: '55%', top: '42%', transform: 'rotate(35deg)' }} />
                {/* Outlined text overlapping the mini cards */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: small ? 14 : 26,
                  color: '#fff',
                  fontFamily: "'Outfit', sans-serif",
                  WebkitTextStroke: strokeWidth,
                  textShadow: `${shadowOffset} ${shadowOffset} 0px #000`,
                }}>
                  +4
                </div>
              </div>
            ) : card?.value === 'wild' ? (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                position: 'relative',
              }}>
                {/* 4-Color Segment Oval Wheel */}
                <div style={{
                  width: small ? '75%' : '65%',
                  height: small ? '75%' : '65%',
                  borderRadius: '50%',
                  background: `conic-gradient(
                    ${CLASSIC_COLORS.red} 0deg 90deg, 
                    ${CLASSIC_COLORS.yellow} 90deg 180deg, 
                    ${CLASSIC_COLORS.green} 180deg 270deg, 
                    ${CLASSIC_COLORS.blue} 270deg 360deg
                  )`,
                  border: '1.5px solid #000',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  transform: 'rotate(-26deg)',
                }} />
                {/* WILD text banner overlay */}
                <div style={{
                  position: 'absolute',
                  fontWeight: 900,
                  fontSize: small ? 10 : 16,
                  color: '#fff',
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: -0.5,
                  WebkitTextStroke: strokeWidth,
                  textShadow: `${shadowOffset} ${shadowOffset} 0px #000`,
                  background: 'rgba(0,0,0,0.85)',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: '1px solid #fff',
                }}>
                  WILD
                </div>
              </div>
            ) : (
              /* Standard Number or Action Symbols */
              <span
                style={{
                  color: baseColor,
                  fontWeight: 900,
                  fontSize: isSpecial && !small ? 36 : small ? 20 : 48,
                  fontFamily: "'Outfit', sans-serif",
                  WebkitTextStroke: strokeWidth,
                  textShadow: `${shadowOffset} ${shadowOffset} 0px #000`,
                  textDecoration: needsUnderline ? 'underline' : 'none',
                }}
              >
                {displayValue}
              </span>
            )}
          </div>
        </div>

        {/* Top-Left Corner Indicator */}
        <div style={{
          position: 'absolute',
          top: small ? 2 : 4,
          left: small ? 4 : 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
        }}>
          {card?.color === 'wild' ? (
            /* Mini 4-color oval for wild corner */
            <div style={{
              width: small ? 8 : 12,
              height: small ? 8 : 12,
              borderRadius: '50%',
              background: `conic-gradient(
                ${CLASSIC_COLORS.red} 0deg 90deg, 
                ${CLASSIC_COLORS.yellow} 90deg 180deg, 
                ${CLASSIC_COLORS.green} 180deg 270deg, 
                ${CLASSIC_COLORS.blue} 270deg 360deg
              )`,
              border: '0.8px solid #000',
              marginTop: 4,
            }} />
          ) : (
            <span style={{
              color: '#fff',
              fontWeight: 800,
              fontSize: small ? 11 : 16,
              fontFamily: "'Outfit', sans-serif",
              WebkitTextStroke: '1px #000',
              textShadow: '1px 1px 0px #000',
              textDecoration: needsUnderline ? 'underline' : 'none',
            }}>
              {displayValue}
            </span>
          )}
        </div>

        {/* Bottom-Right Corner Indicator (Rotated) */}
        <div style={{
          position: 'absolute',
          bottom: small ? 2 : 4,
          right: small ? 4 : 8,
          transform: 'rotate(180deg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
        }}>
          {card?.color === 'wild' ? (
            <div style={{
              width: small ? 8 : 12,
              height: small ? 8 : 12,
              borderRadius: '50%',
              background: `conic-gradient(
                ${CLASSIC_COLORS.red} 0deg 90deg, 
                ${CLASSIC_COLORS.yellow} 90deg 180deg, 
                ${CLASSIC_COLORS.green} 180deg 270deg, 
                ${CLASSIC_COLORS.blue} 270deg 360deg
              )`,
              border: '0.8px solid #000',
              marginTop: 4,
            }} />
          ) : (
            <span style={{
              color: '#fff',
              fontWeight: 800,
              fontSize: small ? 11 : 16,
              fontFamily: "'Outfit', sans-serif",
              WebkitTextStroke: '1px #000',
              textShadow: '1px 1px 0px #000',
              textDecoration: needsUnderline ? 'underline' : 'none',
            }}>
              {displayValue}
            </span>
          )}
        </div>

        {/* Active Chosen Wild Color indicator dot at bottom-left */}
        {card?.color === 'wild' && card?.chosenColor && (
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              left: 8,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: CLASSIC_COLORS[card.chosenColor] || '#fff',
              border: '1.5px solid #fff',
              boxShadow: `0 0 8px ${GLOWS[card.chosenColor]}`,
            }}
          />
        )}

      </div>
    </div>
  );
}
