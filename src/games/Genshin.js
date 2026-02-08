
import bg from "../images/genshin.jpg"; 
export const Genshin = {
  id: 'genshin',
  name: 'Genshin Impact',
  bg,
  currency: 'Genesis Crystals, Chronal Nexus',
  labelID: 'UID',
  needZone: true, // Requires Server/Zone selection
  categories: ['Standard', 'Chronal Nexus'], // The tabs
  packages: [
    // ==========================================
    // CATEGORY: CHRONAL NEXUS (New Currency)
    // ==========================================
    { id: 'cn_60', name: "60 Chronal Nexus", total: 60, price: 3700, category: "Chronal Nexus" },
    { id: 'cn_330', name: "330 Chronal Nexus", total: 330, price: 18900, category: "Chronal Nexus" },
    { id: 'cn_1090', name: "1090 Chronal Nexus", total: 1090, price: 55900, category: "Chronal Nexus" },
    { id: 'cn_2240', name: "2240 Chronal Nexus", total: 2240, price: 112500, category: "Chronal Nexus" },
    { id: 'cn_3880', name: "3880 Chronal Nexus", total: 3880, price: 188600, category: "Chronal Nexus" },
    { id: 'cn_8080', name: "8080 Chronal Nexus", total: 8080, price: 370600, category: "Chronal Nexus" },
    { id: 'cn_11960', name: "11960 Chronal Nexus", total: 11960, price: 559200, category: "Chronal Nexus" },
    { id: 'cn_16160', name: "16160 Chronal Nexus", total: 16160, price: 741100, category: "Chronal Nexus" },
    { id: 'cn_24240', name: "24240 Chronal Nexus", total: 24240, price: 1111700, category: "Chronal Nexus" },
    { id: 'cn_32320', name: "32320 Chronal Nexus", total: 32320, price: 1482200, category: "Chronal Nexus" },
    { id: 'cn_40400', name: "40400 Chronal Nexus", total: 40400, price: 1852800, category: "Chronal Nexus" },

    // ==========================================
    // CATEGORY: STANDARD (Genesis Crystals)
    // ==========================================
    { id: 'gen_welkin', name: "Blessing of the Welkin Moon", total: 1, price: 17400, tag: "MONTHLY", category: "Standard" },
    
    // Small Packs
    { id: 'gen_60', total: 60, price: 3400, category: "Standard" },
    { id: 'gen_120', total: 120, price: 6800, category: "Standard" },
    { id: 'gen_180', total: 180, price: 10200, category: "Standard" },
    { id: 'gen_240', total: 240, price: 13600, category: "Standard" },
    { id: 'gen_300', total: 300, price: 17000, category: "Standard" },
    { id: 'gen_330', total: 330, price: 17400, category: "Standard", tag: "HOT" },
    { id: 'gen_360', total: 360, price: 20400, category: "Standard" },
    { id: 'gen_390', total: 390, price: 20800, category: "Standard" },
    { id: 'gen_450', total: 450, price: 24200, category: "Standard" },
    { id: 'gen_510', total: 510, price: 27600, category: "Standard" },
    { id: 'gen_570', total: 570, price: 31000, category: "Standard" },
    { id: 'gen_600', total: 600, price: 34000, category: "Standard" },
    { id: 'gen_660', total: 660, price: 34700, category: "Standard" },
    { id: 'gen_720', total: 720, price: 38100, category: "Standard" },
    { id: 'gen_780', total: 780, price: 41500, category: "Standard" },
    { id: 'gen_840', total: 840, price: 44900, category: "Standard" },
    { id: 'gen_900', total: 900, price: 48300, category: "Standard" },
    { id: 'gen_990', total: 990, price: 52100, category: "Standard" },
    
    // Medium Packs
    { id: 'gen_1090', total: 1090, price: 53000, category: "Standard", tag: "POPULAR" },
    { id: 'gen_1150', total: 1150, price: 56400, category: "Standard" },
    { id: 'gen_1210', total: 1210, price: 59800, category: "Standard" },
    { id: 'gen_1270', total: 1270, price: 63200, category: "Standard" },
    { id: 'gen_1330', total: 1330, price: 66600, category: "Standard" },
    { id: 'gen_1420', total: 1420, price: 70300, category: "Standard" },
    { id: 'gen_1480', total: 1480, price: 73700, category: "Standard" },
    { id: 'gen_1540', total: 1540, price: 77100, category: "Standard" },
    { id: 'gen_1600', total: 1600, price: 80500, category: "Standard" },
    { id: 'gen_1660', total: 1660, price: 84000, category: "Standard" },
    { id: 'gen_1750', total: 1750, price: 87700, category: "Standard" },
    { id: 'gen_1810', total: 1810, price: 91100, category: "Standard" },
    { id: 'gen_1870', total: 1870, price: 94500, category: "Standard" },
    { id: 'gen_1930', total: 1930, price: 97900, category: "Standard" },
    { id: 'gen_1990', total: 1990, price: 101300, category: "Standard" },
    { id: 'gen_2080', total: 2080, price: 105000, category: "Standard" },
    { id: 'gen_2180', total: 2180, price: 106000, category: "Standard" },
    { id: 'gen_2240', total: 2240, price: 111400, category: "Standard" },
    
    // Large Packs
    { id: 'gen_2570', total: 2570, price: 128800, category: "Standard" },
    { id: 'gen_2690', total: 2690, price: 135600, category: "Standard" },
    { id: 'gen_2900', total: 2900, price: 146100, category: "Standard" },
    { id: 'gen_3330', total: 3330, price: 164400, category: "Standard" },
    { id: 'gen_3880', total: 3880, price: 180100, category: "Standard" },
    { id: 'gen_4210', total: 4210, price: 197500, category: "Standard" },
    { id: 'gen_4540', total: 4540, price: 214800, category: "Standard" },
    { id: 'gen_4970', total: 4970, price: 233100, category: "Standard" },
    { id: 'gen_5300', total: 5300, price: 250400, category: "Standard" },
    { id: 'gen_5630', total: 5630, price: 267800, category: "Standard" },
    { id: 'gen_6060', total: 6060, price: 286100, category: "Standard" },
    { id: 'gen_6120', total: 6120, price: 291500, category: "Standard" },
    { id: 'gen_6450', total: 6450, price: 308800, category: "Standard" },
    { id: 'gen_6780', total: 6780, price: 326200, category: "Standard" },
    { id: 'gen_7210', total: 7210, price: 344500, category: "Standard" },
    { id: 'gen_8080', total: 8080, price: 346400, category: "Standard", tag: "BEST VALUE" },
    { id: 'gen_8410', total: 8410, price: 363800, category: "Standard" },
    { id: 'gen_9170', total: 9170, price: 399400, category: "Standard" },
    { id: 'gen_10320', total: 10320, price: 457800, category: "Standard" },
    { id: 'gen_11960', total: 11960, price: 526500, category: "Standard" },
    
    // Bulk Packs
    { id: 'gen_16160', total: 16160, price: 692800, category: "Standard" },
    { id: 'gen_15680', total: 15680, price: 711600, category: "Standard" },
    { id: 'gen_20040', total: 20040, price: 873900, category: "Standard" },
    { id: 'gen_24240', total: 24240, price: 1039200, category: "Standard" },
    { id: 'gen_29210', total: 29210, price: 1272300, category: "Standard" },
    { id: 'gen_32320', total: 32320, price: 1385600, category: "Standard" },
    { id: 'gen_40400', total: 40400, price: 1732000, category: "Standard" }
  ]
};