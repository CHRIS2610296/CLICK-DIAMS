export const Genshin = {
  id: 'genshin',
  name: 'Genshin Impact',
  bg: 'https://wallpapers.com/images/hd/genshin-impact-desktop-4k-s7551d9539659359.jpg', // High-quality Genshin BG
  currency: 'Genesis Crystals',
  labelID: 'UID', // Genshin uses UID
  needZone: true, // Genshin usually needs Server/Zone (America, Asia, etc.)
  packages: [
    { id: 'gen_1', base: 60, bonus: 0, total: 60, price: 5000 },
    { id: 'gen_2', base: 300, bonus: 30, total: 330, price: 25000 },
    { id: 'gen_3', base: 980, bonus: 110, total: 1090, price: 75000 },
    { id: 'gen_4', base: 1980, bonus: 260, total: 2240, price: 150000 },
    { id: 'gen_5', base: 3280, bonus: 600, total: 3880, price: 245000 },
    { id: 'gen_6', base: 6480, bonus: 1600, total: 8080, price: 490000 },
    { id: 'gen_welkin', name: "Blessing of the Welkin Moon", total: 1, price: 25000, tag: "MONTHLY" }
  ]
};