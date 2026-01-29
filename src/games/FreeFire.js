import bg from "../images/free-fire.jpg"; 

export const FreeFire = {
  id: 'ff',
  name: "Free Fire",
  currency: "Diamonds",
  labelID: "Player ID",
  needZone: false,
  bg,
  packages: [
    // Small Packs
    { id: 'ff_1', total: 110, base: 100, bonus: 10, price: 4630 , tag: "MORA INDRINDRA"},
    { id: 'ff_2', total: 231, base: 210, bonus: 21, price: 9250 },
    { id: 'ff_3', total: 341, base: 310, bonus: 31, price: 13860 },
    { id: 'ff_4', total: 462, base: 420, bonus: 42, price: 18480 },
    { id: 'ff_5', total: 583, base: 530, bonus: 53, price: 23030 },
    
    // Medium Packs
    { id: 'ff_6', total: 693, base: 630, bonus: 63, price: 27830 },
    { id: 'ff_7', total: 803, base: 730, bonus: 73, price: 32530 },
    { id: 'ff_8', total: 924, base: 840, bonus: 84, price: 37030 },
    { id: 'ff_9', total: 1188, base: 1080, bonus: 108, price: 46530 },
    
    // Large Packs
    { id: 'ff_10', total: 1419, base: 1290, bonus: 129, price: 55500 },
    { id: 'ff_11', total: 1650, base: 1500, bonus: 150, price: 65030 },
    { id: 'ff_12', total: 2420, base: 2200, bonus: 220, price: 93530, tag: "BE MPIVIDY" },
    
    // Whales Packs (High Value)
    { id: 'ff_13', total: 3003, base: 2730, bonus: 273, price: 115000 },
    { id: 'ff_14', total: 4191, base: 3810, bonus: 381, price: 159000 },
    { id: 'ff_15', total: 5423, base: 4930, bonus: 493, price: 205500 },
    { id: 'ff_16', total: 6028, base: 5480, bonus: 548, price: 228000 },
    { id: 'ff_17', total: 10142, base: 9220, bonus: 922, price: 382400, tag: "NY AMBONY INDRINDRA" },
  ]
};