import React from 'react';

const COLOR_DOT = ['#e63946', '#2d9e5f', '#1d7bbf', '#f4c430', '#9b5de5', '#f15bb5', '#00bbf9', '#00f5d4'];

export default function WaitingRoom({ socket, roomId, playerId, lobbyState }) {
  if (!lobbyState) return null;
  const { players, host } = lobbyState;
  const me = players.find(p => p.id === playerId);
  const isHost = host === socket.id;
  const allReady = players.length >= 2 && players.every(p => p.ready);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Righteous', cursive", padding: 24,
      color: '#fff',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Righteous&family=Nunito:wght@400;600;800&display=swap" rel="stylesheet" />

      <div style={{ fontSize: 42, marginBottom: 4 }}>🃏</div>
      <h1 style={{ fontSize: 32, margin: '0 0 4px', letterSpacing: 2 }}>WAITING ROOM</h1>

      <div style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 12, padding: '8px 24px', marginBottom: 32,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 2, fontFamily: "'Nunito',sans-serif" }}>ROOM CODE </span>
        <span style={{ fontSize: 22, letterSpacing: 6 }}>{roomId}</span>
        <button
          onClick={() => navigator.clipboard.writeText(roomId)}
          style={{
            marginLeft: 12, background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14,
          }}
          title="Copy room code"
        >📋</button>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 24, width: '100%', maxWidth: 420,
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontFamily: "'Nunito',sans-serif" }}>
          PLAYERS ({players.length}/8)
        </div>
        {players.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0',
            borderBottom: i < players.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: COLOR_DOT[i % COLOR_DOT.length],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700,
            }}>
              {p.name[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 15 }}>{p.name}</span>
              {p.id === playerId && <span style={{ color: '#f4c430', fontSize: 11, marginLeft: 8 }}>(you)</span>}
              {host === socket.id && p.id === playerId && <span style={{ color: '#f4c430', fontSize: 11, marginLeft: 4 }}>★ host</span>}
            </div>
            <div style={{
              fontSize: 12, fontFamily: "'Nunito',sans-serif",
              color: p.ready ? '#2d9e5f' : 'rgba(255,255,255,0.3)',
              fontWeight: p.ready ? 700 : 400,
            }}>
              {p.ready ? '✓ READY' : 'waiting...'}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 420 }}>
        <button
          onClick={() => socket.emit('player:ready')}
          style={{
            flex: 1, padding: 14,
            background: me?.ready ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #2d9e5f, #1a7a45)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12, color: '#fff', fontSize: 15,
            fontFamily: "'Righteous', cursive", cursor: 'pointer',
            boxShadow: me?.ready ? 'none' : '0 4px 20px rgba(45,158,95,0.4)',
          }}
        >
          {me?.ready ? 'NOT READY' : '✓ READY UP'}
        </button>

        {isHost && (
          <button
            onClick={() => socket.emit('game:start')}
            disabled={!allReady}
            style={{
              flex: 1, padding: 14,
              background: allReady ? 'linear-gradient(135deg, #e63946, #c1121f)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12, color: allReady ? '#fff' : 'rgba(255,255,255,0.3)',
              fontSize: 15, fontFamily: "'Righteous', cursive",
              cursor: allReady ? 'pointer' : 'not-allowed',
              boxShadow: allReady ? '0 4px 20px rgba(230,57,70,0.4)' : 'none',
            }}
          >
            START GAME
          </button>
        )}
      </div>

      {players.length < 2 && (
        <p style={{ marginTop: 20, color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: "'Nunito',sans-serif" }}>
          Waiting for at least 2 players...
        </p>
      )}
    </div>
  );
}
