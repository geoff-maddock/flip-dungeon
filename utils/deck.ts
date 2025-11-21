import { Card, Suit, Rank } from '../types';

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
    case 'diamonds': return 'text-blue-400'; // Game specific: Diamonds = Magick/Wealth (Blue/Goldish, prompt said Red but also Magick usually blue in games, keeping prompt red for consistency or diverging for better UX? Prompt said Diamonds (red). I will use Red for suit color to be accurate to playing cards, but add an icon color for the resource.)
    case 'clubs': return 'text-slate-400';
    case 'spades': return 'text-zinc-200';
  }
};

// Prompt: "Diamonds (red) - magick / wealth". I will stick to visual red for the card itself, but the associated resource might be colored differently in the UI.
