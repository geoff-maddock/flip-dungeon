
import { Card, Suit, Rank, HandCombo } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      let value = parseInt(rank);
      if (rank === 'A') value = 11; // Or 1 depending on game rules, usually Ace is high or 1
      if (['J', 'Q', 'K'].includes(rank)) value = 10;
      if (rank === 'A') value = 1; // Let's stick to low Ace for simplicity unless specified

      deck.push({
        suit,
        rank,
        value: isNaN(parseInt(rank)) ? (rank === 'A' ? 1 : 10) : parseInt(rank),
        id: `${rank}-${suit}-${Math.random().toString(36).substr(2, 9)}`
      });
    });
  });
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const getSuitSymbol = (suit: Suit): string => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
  }
};

export const getSuitColor = (suit: Suit): string => {
  switch (suit) {
    case 'hearts': return 'text-red-500';
    case 'diamonds': return 'text-blue-400'; 
    case 'clubs': return 'text-slate-400';
    case 'spades': return 'text-zinc-200';
  }
};

export const evaluateHandCombo = (cards: Card[]): HandCombo | undefined => {
    if (cards.length < 2) return undefined;

    // Sort by internal rank index for checks
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const sorted = [...cards].sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
    
    // Check for Multiples (Pair, Trips, Quads)
    const rankCounts: Record<string, number> = {};
    sorted.forEach(c => {
        rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
    });

    const counts = Object.values(rankCounts);
    const maxSame = Math.max(...counts);

    if (maxSame === 4) return { name: "Four of a Kind", multiplier: 2.5, bonusPower: 0, cardsInvolved: 4 };
    if (maxSame === 3) return { name: "Three of a Kind", multiplier: 2, bonusPower: 0, cardsInvolved: 3 };
    if (maxSame === 2) {
        // Check two pair?
        const pairs = counts.filter(c => c === 2).length;
        if (pairs === 2 && cards.length === 4) return { name: "Two Pair", multiplier: 1.75, bonusPower: 0, cardsInvolved: 4 };
        return { name: "Pair", multiplier: 1.5, bonusPower: 0, cardsInvolved: 2 };
    }

    // Check Straight (min 3 cards)
    if (cards.length >= 3) {
        let isStraight = true;
        for (let i = 0; i < sorted.length - 1; i++) {
            const currentIdx = rankOrder.indexOf(sorted[i].rank);
            const nextIdx = rankOrder.indexOf(sorted[i+1].rank);
            if (nextIdx !== currentIdx + 1) {
                isStraight = false;
                break;
            }
        }
        if (isStraight) {
            // Flush?
            const suits = new Set(cards.map(c => c.suit));
            if (suits.size === 1) return { name: "Suited Straight", multiplier: 0, bonusPower: 10, cardsInvolved: cards.length };
            return { name: "Straight", multiplier: 0, bonusPower: 5, cardsInvolved: cards.length };
        }
    }

    // Check Flush (min 3 cards)
    if (cards.length >= 3) {
         const suits = new Set(cards.map(c => c.suit));
         if (suits.size === 1) return { name: "Flush", multiplier: 1.25, bonusPower: 0, cardsInvolved: cards.length };
    }

    return undefined;
};
