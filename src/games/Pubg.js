import bg from "../images/pubg.jpg";

export const Pubg = {
  id: 'pubg',
  name: "PUBG Mobile",
  currency: "UC",
  labelID: "Character ID",
  needZone: false,
  bg,
  packages: [
    { id: 'pb_1', total: 60, base: 60, bonus: 0, price: 5000 },
    { id: 'pb_2', total: 325, base: 300, bonus: 25, price: 25000 },
    { id: 'pb_3', total: 660, base: 600, bonus: 60, price: 50000, tag: "BEST SELLER" },
    { id: 'pb_4', total: 1800, base: 1500, bonus: 300, price: 135000 },
  ]
};
