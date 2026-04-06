const COLORS = ['red', 'green', 'blue', 'yellow'];
const VALUES = ['0','1','2','3','4','5','6','7','8','9','skip','reverse','draw2'];
const WILD_CARDS = ['wild', 'wild4'];

function createDeck() {
  const deck = [];
  for (const color of COLORS) {
    for (const value of VALUES) {
      deck.push({ color, value, id: `${color}-${value}-1` });
      if (value !== '0') deck.push({ color, value, id: `${color}-${value}-2` });
    }
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ color: 'wild', value: 'wild', id: `wild-${i}` });
    deck.push({ color: 'wild', value: 'wild4', id: `wild4-${i}` });
  }
  return shuffle(deck);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function canPlay(card, topCard, currentColor) {
  if (card.value === 'wild' || card.value === 'wild4') return true;
  if (card.color === currentColor) return true;
  if (card.value === topCard.value) return true;
  return false;
}

function createGame(roomId, players) {
  const deck = createDeck();
  const hands = {};
  for (const p of players) {
    hands[p.id] = deck.splice(0, 7);
  }
  // Find first non-wild card for discard
  let firstCard;
  let deckCopy = [...deck];
  while (true) {
    firstCard = deckCopy.shift();
    if (!WILD_CARDS.includes(firstCard.value)) break;
    deckCopy.push(firstCard);
  }
  const discardPile = [firstCard];
  const remainingDeck = deckCopy;

  return {
    roomId,
    players: players.map(p => ({ ...p, cardCount: 7, saidUno: false })),
    hands,
    deck: remainingDeck,
    discardPile,
    currentPlayerIndex: 0,
    direction: 1, // 1 = clockwise, -1 = counter
    currentColor: firstCard.color,
    status: 'playing',
    winner: null,
    drawPending: 0,
    mustDraw: false,
    log: [`Game started! First card: ${firstCard.color} ${firstCard.value}`],
  };
}

function nextPlayerIndex(game, skip = false) {
  const n = game.players.length;
  let steps = skip ? 2 : 1;
  return ((game.currentPlayerIndex + game.direction * steps) % n + n) % n;
}

function reshuffleDeck(game) {
  if (game.discardPile.length <= 1) return;
  const top = game.discardPile[game.discardPile.length - 1];
  const reshuffled = shuffle(game.discardPile.slice(0, -1).map(c => ({
    ...c,
    color: WILD_CARDS.includes(c.value) ? 'wild' : c.color
  })));
  game.deck = reshuffled;
  game.discardPile = [top];
}

function drawCards(game, playerId, count) {
  const drawn = [];
  for (let i = 0; i < count; i++) {
    if (game.deck.length === 0) reshuffleDeck(game);
    if (game.deck.length === 0) break;
    drawn.push(game.deck.shift());
  }
  game.hands[playerId].push(...drawn);
  const player = game.players.find(p => p.id === playerId);
  if (player) player.cardCount = game.hands[playerId].length;
  return drawn;
}

function playCard(game, playerId, cardId, chosenColor = null) {
  const currentPlayer = game.players[game.currentPlayerIndex];
  if (currentPlayer.id !== playerId) return { error: 'Not your turn' };

  const hand = game.hands[playerId];
  const cardIndex = hand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) return { error: 'Card not in hand' };

  const card = hand[cardIndex];
  const topCard = game.discardPile[game.discardPile.length - 1];

  if (!canPlay(card, topCard, game.currentColor)) return { error: 'Cannot play this card' };

  // Remove from hand
  hand.splice(cardIndex, 1);
  const player = game.players.find(p => p.id === playerId);
  player.cardCount = hand.length;
  player.saidUno = false;

  // Set color for wild
  let effectiveColor = card.color;
  if (WILD_CARDS.includes(card.value)) {
    effectiveColor = chosenColor || 'red';
    game.discardPile.push({ ...card, chosenColor: effectiveColor });
  } else {
    game.discardPile.push(card);
  }
  game.currentColor = effectiveColor;

  game.log.push(`${player.name} played ${card.color} ${card.value}`);

  // Check win
  if (hand.length === 0) {
    game.status = 'finished';
    game.winner = player;
    game.log.push(`🎉 ${player.name} wins!`);
    return { success: true, game };
  }

  // Apply card effects
  let skipNext = false;
  if (card.value === 'skip') {
    skipNext = true;
    game.log.push(`${game.players[nextPlayerIndex(game)].name} was skipped!`);
  } else if (card.value === 'reverse') {
    game.direction *= -1;
    if (game.players.length === 2) skipNext = true;
    game.log.push('Direction reversed!');
  } else if (card.value === 'draw2') {
    const target = game.players[nextPlayerIndex(game)];
    drawCards(game, target.id, 2);
    skipNext = true;
    game.log.push(`${target.name} draws 2 cards and is skipped!`);
  } else if (card.value === 'wild4') {
    const target = game.players[nextPlayerIndex(game)];
    drawCards(game, target.id, 4);
    skipNext = true;
    game.log.push(`${target.name} draws 4 cards and is skipped!`);
  }

  game.currentPlayerIndex = nextPlayerIndex(game, skipNext);
  return { success: true, game };
}

function drawCard(game, playerId) {
  const currentPlayer = game.players[game.currentPlayerIndex];
  if (currentPlayer.id !== playerId) return { error: 'Not your turn' };

  const drawn = drawCards(game, playerId, 1);
  game.log.push(`${currentPlayer.name} draws a card`);

  // Check if drawn card is playable
  const topCard = game.discardPile[game.discardPile.length - 1];
  const drawnCard = drawn[0];
  const canPlayDrawn = drawnCard && canPlay(drawnCard, topCard, game.currentColor);

  // If the drawn card is playable, DON'T advance turn yet
  // Let the player decide if they want to play it
  if (!canPlayDrawn) {
    // Card not playable, advance turn immediately
    game.currentPlayerIndex = nextPlayerIndex(game);
  }
  // If playable, turn stays with current player to let them play it

  return { success: true, game, drawn, canPlayDrawn };
}

function callUno(game, playerId) {
  const player = game.players.find(p => p.id === playerId);
  if (!player) return { error: 'Player not found' };
  if (game.hands[playerId].length !== 1) return { error: 'Must have exactly 1 card to say UNO' };
  player.saidUno = true;
  game.log.push(`${player.name} says UNO! 🎯`);
  return { success: true, game };
}

module.exports = { createGame, playCard, drawCard, callUno, canPlay };
