export const ArenaBreakout = {
  id: 'ab',
  name: 'Arena Breakout',
  bg: 'https://wallpapers.com/images/hd/arena-breakout-1920-x-1080-wallpaper-h579998895999555.jpg', 
  currency: 'Bonds',
  labelID: 'Player ID',
  needZone: false, // Usually just Player ID is enough
  packages: [
    { id: 'ab_1', total: 60, price: 4500 },
    { id: 'ab_2', total: 310, price: 22000, tag: "POPULAR" },
    { id: 'ab_3', total: 630, price: 44000 },
    { id: 'ab_4', total: 1300, price: 88000 },
    { id: 'ab_5', total: 3200, price: 215000 },
    { id: 'ab_6', total: 6500, price: 430000 },
    { id: 'ab_pass', name: "Battle Pass", total: 1, price: 45000, tag: "PASS" }
  ]
};