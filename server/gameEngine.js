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

function canPlay(card, topCard, currentColor, drawPending = 0, stackDraw2 = false) {
  if (stackDraw2 && drawPending > 0) return card.value === 'draw2';
  if (card.value === 'wild' || card.value === 'wild4') return true;
  if (card.color === currentColor) return true;
  if (card.value === topCard.value) return true;
  return false;
}

function sortCards(cards) {
  return cards.sort((a, b) => {
    // Wild cards always go last
    const aIsWild = WILD_CARDS.includes(a.value);
    const bIsWild = WILD_CARDS.includes(b.value);
    
    if (aIsWild && !bIsWild) return 1;
    if (!aIsWild && bIsWild) return -1;
    if (aIsWild && bIsWild) return 0;
    
    // Sort by color first
    const aColorIndex = COLORS.indexOf(a.color);
    const bColorIndex = COLORS.indexOf(b.color);
    if (aColorIndex !== bColorIndex) {
      return aColorIndex - bColorIndex;
    }
    
    // Then sort by value (numbers first, then special cards)
    const aValue = a.value;
    const bValue = b.value;
    
    // Check if values are numbers
    const aIsNumber = /^\d+$/.test(aValue);
    const bIsNumber = /^\d+$/.test(bValue);
    
    if (aIsNumber && bIsNumber) {
      return parseInt(aValue) - parseInt(bValue);
    }
    
    if (aIsNumber && !bIsNumber) return -1;
    if (!aIsNumber && bIsNumber) return 1;
    
    // Sort special cards: skip, reverse, draw2
    const specialOrder = ['skip', 'reverse', 'draw2'];
    const aSpecialIndex = specialOrder.indexOf(aValue);
    const bSpecialIndex = specialOrder.indexOf(bValue);
    
    if (aSpecialIndex !== -1 && bSpecialIndex !== -1) {
      return aSpecialIndex - bSpecialIndex;
    }
    
    if (aSpecialIndex !== -1 && bSpecialIndex === -1) return -1;
    if (aSpecialIndex === -1 && bSpecialIndex !== -1) return 1;
    
    return 0;
  });
}

function createGame(roomId, players, { stackDraw2 = false, drawTillColor = false } = {}) {
  const deck = createDeck();
  const hands = {};
  for (const p of players) {
    const hand = deck.splice(0, 7);
    hands[p.id] = sortCards(hand);
  }
  // Find first non-wild, non-skip card for discard
  let firstCard;
  let deckCopy = [...deck];
  while (true) {
    firstCard = deckCopy.shift();
    if (!WILD_CARDS.includes(firstCard.value) && firstCard.value !== 'skip') break;
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
    stackDraw2,
    drawTillColor,
    turnTimerStart: Date.now(),
    createdAt: Date.now(),
    lastActivity: Date.now(),
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
  // Sort the hand after adding new cards
  game.hands[playerId] = sortCards(game.hands[playerId]);
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

  if (!canPlay(card, topCard, game.currentColor, game.drawPending, game.stackDraw2)) return { error: 'Cannot play this card' };

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
    
    // Calculate official UNO points (sum of remaining opponent cards)
    let score = 0;
    for (const pid in game.hands) {
      const pHand = game.hands[pid];
      for (const card of pHand) {
        if (card.value === 'wild' || card.value === 'wild4') {
          score += 50;
        } else if (card.value === 'skip' || card.value === 'reverse' || card.value === 'draw2') {
          score += 20;
        } else {
          const val = parseInt(card.value, 10);
          if (!isNaN(val)) {
            score += val;
          }
        }
      }
    }
    game.winnerScore = score;
    game.log.push(`🎉 ${player.name} wins with ${score} points!`);
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
    if (game.stackDraw2) {
      game.drawPending += 2;
      const next = game.players[nextPlayerIndex(game)];
      game.log.push(`${player.name} stacks! ${next.name} must draw ${game.drawPending} or stack!`);
    } else {
      const target = game.players[nextPlayerIndex(game)];
      drawCards(game, target.id, 2);
      skipNext = true;
      game.log.push(`${target.name} draws 2 cards and is skipped!`);
    }
  } else if (card.value === 'wild4') {
    const target = game.players[nextPlayerIndex(game)];
    drawCards(game, target.id, 4);
    skipNext = true;
    game.log.push(`${target.name} draws 4 cards and is skipped!`);
  }

  game.currentPlayerIndex = nextPlayerIndex(game, skipNext);
  game.turnTimerStart = Date.now();
  game.lastActivity = Date.now();
  return { success: true, game };
}

function drawCard(game, playerId) {
  const currentPlayer = game.players[game.currentPlayerIndex];
  if (currentPlayer.id !== playerId) return { error: 'Not your turn' };

  // Stacking active: player must draw all pending cards, turn advances
  if (game.stackDraw2 && game.drawPending > 0) {
    const count = game.drawPending;
    const drawn = drawCards(game, playerId, count);
    game.drawPending = 0;
    game.log.push(`${currentPlayer.name} draws ${count} cards!`);
    game.currentPlayerIndex = nextPlayerIndex(game);
    game.turnTimerStart = Date.now();
    game.lastActivity = Date.now();
    return { success: true, game, drawn, canPlayDrawn: false };
  }

  const drawn = [];
  let matchingCard = null;

  if (game.drawTillColor) {
    // Keep drawing until matching color (or wild) is drawn
    while (true) {
      const cardArray = drawCards(game, playerId, 1);
      if (cardArray.length === 0) break; // Deck empty
      const drawnCard = cardArray[0];
      drawn.push(drawnCard);
      
      // Check if it matches currentColor
      if (drawnCard.color === game.currentColor || drawnCard.color === 'wild') {
        matchingCard = drawnCard;
        break;
      }
    }
  } else {
    // Draw only 1 card
    const cardArray = drawCards(game, playerId, 1);
    if (cardArray.length > 0) {
      const drawnCard = cardArray[0];
      drawn.push(drawnCard);
      if (drawnCard.color === game.currentColor || drawnCard.color === 'wild') {
        matchingCard = drawnCard;
      }
    }
  }

  if (drawn.length > 0) {
    if (matchingCard) {
      game.log.push(`${currentPlayer.name} drew and automatically played ${matchingCard.color === 'wild' ? 'Wild' : matchingCard.color} ${matchingCard.value}`);
      
      // Remove matchingCard from player's hand since drawCards already added it to hands[playerId]
      game.hands[playerId] = game.hands[playerId].filter(c => c.id !== matchingCard.id);
      
      // Push to discard pile
      let effectiveColor = matchingCard.color;
      if (matchingCard.color === 'wild') {
        effectiveColor = game.currentColor; // Default to table color
        game.discardPile.push({ ...matchingCard, chosenColor: effectiveColor });
      } else {
        game.discardPile.push(matchingCard);
      }
      game.currentColor = effectiveColor;
      
      // Check win (just in case)
      if (game.hands[playerId].length === 0) {
        game.status = 'finished';
        game.winner = currentPlayer;
        // recalculate score
        let score = 0;
        for (const pid in game.hands) {
          const pHand = game.hands[pid];
          for (const card of pHand) {
            if (card.value === 'wild' || card.value === 'wild4') score += 50;
            else if (card.value === 'skip' || card.value === 'reverse' || card.value === 'draw2') score += 20;
            else {
              const val = parseInt(card.value, 10);
              if (!isNaN(val)) score += val;
            }
          }
        }
        game.winnerScore = score;
      } else {
        // Apply card effects
        let skipNext = false;
        if (matchingCard.value === 'skip') {
          skipNext = true;
          game.log.push(`${game.players[nextPlayerIndex(game)].name} was skipped!`);
        } else if (matchingCard.value === 'reverse') {
          game.direction *= -1;
          if (game.players.length === 2) skipNext = true;
          game.log.push('Direction reversed!');
        } else if (matchingCard.value === 'draw2') {
          if (game.stackDraw2) {
            game.drawPending += 2;
          } else {
            drawCards(game, game.players[nextPlayerIndex(game)].id, 2);
            skipNext = true;
            game.log.push(`${game.players[nextPlayerIndex(game)].name} draws 2 and is skipped!`);
          }
        } else if (matchingCard.value === 'wild4') {
          drawCards(game, game.players[nextPlayerIndex(game)].id, 4);
          skipNext = true;
          game.log.push(`${game.players[nextPlayerIndex(game)].name} draws 4 and is skipped!`);
        }
        
        game.currentPlayerIndex = nextPlayerIndex(game, skipNext);
        game.turnTimerStart = Date.now();
      }
      
      game.lastActivity = Date.now();
      return { success: true, game, drawn, canPlayDrawn: true };
    } else {
      game.log.push(`${currentPlayer.name} draws a card`);
      game.currentPlayerIndex = nextPlayerIndex(game);
      game.turnTimerStart = Date.now();
      game.lastActivity = Date.now();
      return { success: true, game, drawn, canPlayDrawn: false };
    }
  }

  return { success: true, game, drawn, canPlayDrawn: false };
}

function callUno(game, playerId) {
  const player = game.players.find(p => p.id === playerId);
  if (!player) return { error: 'Player not found' };
  if (game.hands[playerId].length !== 1) return { error: 'Must have exactly 1 card to say UNO' };
  player.saidUno = true;
  game.log.push(`${player.name} says UNO! 🎯`);
  return { success: true, game };
}

function catchUno(game, catcherId, targetId) {
  if (catcherId === targetId) return { error: 'Cannot catch yourself' };
  const target = game.players.find(p => p.id === targetId);
  const catcher = game.players.find(p => p.id === catcherId);
  if (!target || !catcher) return { error: 'Player not found' };

  const targetEligible =
    game.hands[targetId].length === 1 &&
    !target.saidUno &&
    game.players[game.currentPlayerIndex].id !== targetId;

  if (targetEligible) {
    drawCards(game, targetId, 2);
    game.log.push(`${catcher.name} caught ${target.name} without UNO! ${target.name} draws 2!`);
    return { success: true, caught: true };
  } else {
    drawCards(game, catcherId, 2);
    game.log.push(`${catcher.name} failed to catch ${target.name}! ${catcher.name} draws 2!`);
    return { success: true, caught: false };
  }
}

module.exports = { createGame, playCard, drawCard, callUno, catchUno, canPlay, nextPlayerIndex, drawCards, sortCards };
