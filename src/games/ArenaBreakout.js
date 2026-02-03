import bg from '../images/ar.jpg';
export const ArenaBreakout = {
  id: 'ab',
  name: 'Arena Breakout',
  bg,
  currency: 'Bonds',
  labelID: 'Player ID',
  needZone: false, // Usually only Player ID is needed
  packages: [
    // --- BATTLE PASS ---
    { id: 'ab_pass', name: "Battle Pass (Standard)", total: 1, price: 17400, tag: "HOT" },
    { id: 'ab_pass_prem', name: "Battle Pass (Premium)", total: 1, price: 34000, tag: "PREMIUM" },

    // --- BONDS PACKAGES ---
    { id: 'ab_60', total: 60, price: 3400 },
    { id: 'ab_310', total: 310, price: 17500, tag: "POPULAR" },
    { id: 'ab_630', total: 630, price: 35600 },
    { id: 'ab_1300', total: 1300, price: 73500 },
    { id: 'ab_3200', total: 3200, price: 180000 },
    { id: 'ab_6500', total: 6500, price: 367000, tag: "BEST VALUE" }
  ]
};