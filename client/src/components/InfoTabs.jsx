import React, { useState } from 'react';
import AdUnit from './AdUnit';

export default function InfoTabs() {
  const [activeTab, setActiveTab] = useState('rules');

  const tabs = [
    { id: 'rules', label: '📖 Game Rules' },
    { id: 'strategies', label: '⚡ Pro Strategies' },
    { id: 'devlog', label: '🛠 Developer Devlog' },
    { id: 'privacy', label: '🔒 Privacy Policy' },
    { id: 'terms', label: '📜 Terms of Service' },
  ];

  return (
    <div className="glass-panel" style={{
      width: '100%',
      maxWidth: 960,
      marginTop: 40,
      padding: '24px 32px 40px 32px',
      textAlign: 'left',
      zIndex: 10,
      position: 'relative',
      border: '1px solid rgba(255, 255, 255, 0.08)',
    }}>
      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: 16,
        marginBottom: 24,
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              border: activeTab === tab.id ? '1px solid var(--accent)' : '1px solid transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{
        color: 'var(--text-primary)',
        lineHeight: 1.7,
        fontSize: 15,
        maxHeight: 500,
        overflowY: 'auto',
        paddingRight: 12,
      }}>
        {activeTab === 'rules' && (
          <div>
            <h2 style={{ color: '#fff', marginBottom: 16, fontSize: 24, borderBottom: '1.5px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>UNO Game Rules & House Modifications</h2>
            <p style={{ marginBottom: 16 }}>
              Welcome to the ultimate digital edition of the classic multiplayer card game. In this version, we combine standard rules with customizable, high-stakes house rules to create a fast-paced, real-time multiplayer arena.
            </p>
            
            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>The Objective</h3>
            <p style={{ marginBottom: 16 }}>
              The core goal of UNO is to be the first player to discard all the cards in your hand. When you are down to a single card, you must call out "UNO" to warn other players. Failure to call UNO before another player calls you out results in a penalty draw of two cards. Players score points based on the cards remaining in their opponents' hands at the end of each round.
            </p>

            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>Setup and Basic Gameplay</h3>
            <p style={{ marginBottom: 12 }}>
              A standard deck consists of 108 cards, spanning four colors (Red, Green, Blue, and Yellow) and special action cards. Each player starts with 7 cards. The remaining deck forms the Draw Pile, and the top card is flipped over to form the Discard Pile.
            </p>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}><strong>Matching Play:</strong> On your turn, you must match a card from your hand to the top card of the Discard Pile, either by color, number, or symbol.</li>
              <li style={{ marginBottom: 8 }}><strong>Wild Cards:</strong> Wild and Wild Draw 4 cards can be played on any card regardless of color or number. The player playing the Wild card declares the active color for the next player.</li>
              <li style={{ marginBottom: 8 }}><strong>Drawing:</strong> If you do not have a matching card, you must draw a card from the Draw Pile. If the drawn card is playable, you can choose to play it immediately; otherwise, your turn ends.</li>
            </ul>

            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>Special Action Cards</h3>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}><strong>Skip:</strong> The next player in the turn sequence loses their turn.</li>
              <li style={{ marginBottom: 8 }}><strong>Reverse:</strong> Reverses the direction of play (clockwise to counter-clockwise, or vice versa).</li>
              <li style={{ marginBottom: 8 }}><strong>Draw 2 (+2):</strong> The next player must draw 2 cards and forfeit their turn (unless Stacking rules are enabled).</li>
              <li style={{ marginBottom: 8 }}><strong>Wild:</strong> Allows the player to change the active color.</li>
              <li style={{ marginBottom: 8 }}><strong>Wild Draw 4 (+4):</strong> Allows the player to choose the next active color and forces the next player to draw 4 cards.</li>
            </ul>

            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>House Rules Enabled in This Version</h3>
            <p style={{ marginBottom: 12 }}>
              To make games more engaging, our custom server supports several popular house configurations:
            </p>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}><strong>Stacking +2:</strong> If a player plays a Draw 2 card, the next player can respond by playing another Draw 2 card, adding to the penalty count. The total penalty is passed to the next player. This continues until a player cannot stack, forcing them to draw the accumulated total (e.g., 2, 4, 6, or 8 cards).</li>
              <li style={{ marginBottom: 8 }}><strong>Draw Till Color Match:</strong> Unlike traditional rules where you draw only one card when unable to play, this setting forces players to continually draw cards from the deck until they find a card that matches the current color or is a Wild card. The matching card is then played automatically.</li>
            </ul>
          </div>
        )}

        {activeTab === 'strategies' && (
          <div>
            <h2 style={{ color: '#fff', marginBottom: 16, fontSize: 24, borderBottom: '1.5px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>Pro UNO Strategies & Analytics</h2>
            <p style={{ marginBottom: 16 }}>
              UNO might seem like a game of pure luck, but consistent winners employ math-based tactical decisions, hand-counting strategies, and psychological tricks.
            </p>
            
            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>1. Color Control and Hand Balancing</h3>
            <p style={{ marginBottom: 16 }}>
              Always monitor the distribution of colors in your hand. If you hold five Red cards and only one Blue card, prioritize changing the active color to Red. Alternatively, if a opponent is down to their last two cards, look at what color they have been actively avoiding or unable to match, and try to change the play to that color using Wild cards or Action cards.
            </p>

            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>2. Strategic Saving of Wild Cards</h3>
            <p style={{ marginBottom: 16 }}>
              Do not play your Wild or Wild Draw 4 cards too early. They are your lifeline when you have no other options. Keep them for the late-game phase when players have fewer cards, as they give you absolute control over the game state. Additionally, playing a Wild Draw 4 when an opponent has only 1 card remaining is the ultimate defensive counter.
            </p>

            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>3. Counter-acting Stacking Chains</h3>
            <p style={{ marginBottom: 16 }}>
              When playing with the **Stacking +2** house rule, keep a Draw 2 card in your hand even if you have regular matching color cards. Saving it as a defensive tool allows you to pass the penalty down the line if an opponent attempts to stack a Draw 2 on you.
            </p>

            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>4. High-Point Card Management</h3>
            <p style={{ marginBottom: 16 }}>
              Because points are calculated at the end of each round based on the cards left in opponents' hands, holding Wild cards (50 points) and Action cards (20 points) at the end of a game is extremely risky. If you notice another player is about to win, try to discard your high-value cards to minimize the points they will score if they succeed in going out.
            </p>
          </div>
        )}

        {activeTab === 'devlog' && (
          <div>
            <h2 style={{ color: '#fff', marginBottom: 16, fontSize: 24, borderBottom: '1.5px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>Developer Devlog & Tech Architecture</h2>
            <p style={{ marginBottom: 16 }}>
              This platform was built to demonstrate real-time WebSocket state synchronization using a modern, reactive stack. Here is an overview of how the game's engineering logic is structured.
            </p>

            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>1. Real-Time Engine (Socket.io)</h3>
            <p style={{ marginBottom: 16 }}>
              The server uses Node.js and Express coupled with Socket.io. Game rooms are organized into unique rooms on the server. Whenever a player takes an action (draws a card, plays a card, calls UNO), the request is validated against the server-side state machine. If valid, the new game state is broadcasted to all participants in the room, triggering smooth UI re-renders on the client.
            </p>

            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>2. Responsive CSS Grid & Flexbox Canvas</h3>
            <p style={{ marginBottom: 16 }}>
              To ensure that players on mobile devices, tablets, and desktop displays all enjoy a unified experience, the game board leverages a dynamic layout calculation system. Opponent hands are arranged circularly around the discard pile using trigonometric angle distributions, while the active player's hand adapts smoothly using flex wrapping.
            </p>

            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>3. Synthesized Web Audio API</h3>
            <p style={{ marginBottom: 16 }}>
              Instead of requesting large audio files (.mp3 or .wav) over the network, this application utilizes the native browser **Web Audio API** to generate sound effects procedurally. This keeps load times low and ensures zero-latency audio feedback when drawing cards, passing turns, or warning players when the turn timer is running low.
            </p>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div>
            <h2 style={{ color: '#fff', marginBottom: 16, fontSize: 24, borderBottom: '1.5px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>Privacy Policy</h2>
            <p style={{ marginBottom: 16 }}>Last Updated: July 2026</p>
            <p style={{ marginBottom: 16 }}>
              This Privacy Policy describes how we collect, use, and share information in connection with your use of our website. We are committed to protecting your privacy online.
            </p>

            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>1. Information We Collect</h3>
            <p style={{ marginBottom: 16 }}>
              We do not require user accounts to play. We collect minimal personal data, such as the temporary player name you select to join a game room. This information is stored in-memory on our server and is discarded once the game room is closed or you disconnect. We also collect anonymized usage data through Google AdSense and analytics tools.
            </p>

            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>2. Google AdSense & Cookies</h3>
            <p style={{ marginBottom: 16 }}>
              We use third-party advertising companies, specifically Google AdSense, to serve ads when you visit our website. These companies may use cookies, device identifiers, and similar technologies to collect information about your visits to this and other websites to provide personalized advertisements about goods and services of interest to you.
            </p>
            <p style={{ marginBottom: 16 }}>
              You can choose to disable or selectively turn off our cookies or third-party cookies in your browser settings, or by managing preferences in your cookie consent banner.
            </p>

            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>3. Data Security</h3>
            <p style={{ marginBottom: 16 }}>
              We implement industry-standard security measures to safeguard your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee its absolute security.
            </p>
          </div>
        )}

        {activeTab === 'terms' && (
          <div>
            <h2 style={{ color: '#fff', marginBottom: 16, fontSize: 24, borderBottom: '1.5px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>Terms of Service</h2>
            <p style={{ marginBottom: 16 }}>Last Updated: July 2026</p>
            <p style={{ marginBottom: 16 }}>
              By accessing or using our UNO Multiplayer website, you agree to comply with and be bound by the following Terms of Service. Please read these terms carefully before playing.
            </p>

            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>1. Acceptable Use</h3>
            <p style={{ marginBottom: 16 }}>
              You agree to use this website solely for lawful, non-commercial entertainment purposes. You agree not to:
            </p>
            <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Attempt to disrupt or interfere with the server infrastructure or WebSocket connections.</li>
              <li style={{ marginBottom: 8 }}>Deploy automated scripts, bots, or modifications to gain an unfair advantage in multiplayer games.</li>
              <li style={{ marginBottom: 8 }}>Use offensive, abusive, or inappropriate nicknames when creating or joining game lobbies.</li>
            </ul>

            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>2. Intellectual Property</h3>
            <p style={{ marginBottom: 16 }}>
              UNO is a registered trademark of Mattel, Inc. This application is an open-source, non-commercial developer demonstration of real-time web mechanics. All game logos, vector card representations, and programmatic components are created for educational and experimental purposes.
            </p>

            <h3 style={{ color: '#fff', marginTop: 20, marginBottom: 10, fontSize: 18 }}>3. Disclaimer of Warranties</h3>
            <p style={{ marginBottom: 16 }}>
              This service is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, secure, or free of bugs or errors.
            </p>
          </div>
        )}
      </div>

      {/* Ad Placement Inside Policy Compliance Content */}
      <div style={{
        marginTop: 24,
        paddingTop: 16,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <AdUnit adSlot="8007516946" />
      </div>
    </div>
  );
}
