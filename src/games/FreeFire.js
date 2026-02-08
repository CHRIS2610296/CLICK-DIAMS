import bg from "../images/free-fire.jpg"; 
import bgcard from "../images/ff.jpg";
export const FreeFire = {
  id: 'ff',
  name: "Free Fire",
  currency: "Diamonds",
  labelID: "Player ID",
  needZone: false,
  bg,
  bgcard,
  packages: [
    // Small Packs
    { id: 'ff_1', total: 110, base: 100, bonus: 10, price: 4550 , tag: "CHEAPEST"},
    { id: 'ff_2', total: 231, base: 210, bonus: 21, price: 9100 },
    { id: 'ff_3', total: 341, base: 310, bonus: 31, price: 13700 },
    { id: 'ff_4', total: 462, base: 420, bonus: 42, price: 18200 },
    { id: 'ff_5', total: 583, base: 530, bonus: 53, price: 22800 },
    
    // Medium Packs
    { id: 'ff_6', total: 693, base: 630, bonus: 63, price: 27400 },
    { id: 'ff_7', total: 803, base: 730, bonus: 73, price: 31500 },
    { id: 'ff_8', total: 924, base: 840, bonus: 84, price: 36700 },
    { id: 'ff_9', total: 1188, base: 1080, bonus: 108, price: 45530 },
    
    // Large Packs
    { id: 'ff_10', total: 1419, base: 1290, bonus: 129, price: 55000 },
    { id: 'ff_11', total: 1650, base: 1500, bonus: 150, price: 64230 },
    { id: 'ff_12', total: 2420, base: 2200, bonus: 220, price: 91000, tag: "POPULAR" },
    
    { id: 'ff_13', total: 3003, base: 2730, bonus: 273, price: 113800 },
    { id: 'ff_14', total: 4191, base: 3810, bonus: 381, price: 157000 },
    { id: 'ff_15', total: 5423, base: 4930, bonus: 493, price: 203500 },
    { id: 'ff_16', total: 6028, base: 5480, bonus: 548, price: 226000 },
    { id: 'ff_17', total: 10142, base: 9220, bonus: 922, price: 380400, tag: "HIGHEST" },
  ]
};