export const OPENWEATHER_API_KEY = "fe82d18fe20e058910aacedc937ff808";
export const DEFAULT_CITY = "Antananarivo";
export const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Mois en malgache
export const monthsMG = [
  "Janoary", "Febroary", "Martsa", "Aprily", "Mey", "Jona",
  "Jolay", "Aogositra", "Septambra", "Oktobra", "Novambra", "Desambra"
];

// Calendrier agricole par mois
export const farmingCalendar = [
  { 
    month: 0, 
    icon: "❄️",
    activities: [
      "Miomana amin'ny fambolena", 
      "Manamboatra sy manitsy fitaovana fambolena", 
      "Mamantatra ny tany hofarana", 
      "Mividy voa sy zava-boary", 
      "Manangona akora organika (zezika)"
    ]
  },
  { 
    month: 1, 
    icon: "🪓",
    activities: [
      "Famafazana ny ala sy ny kirihitrala", 
      "Fanapahana hazo", 
      "Fandoroana ny tany", 
      "Fanodinana sy fanadiovana ny tany", 
      "Fametrahana zezika"
    ]
  },
  { 
    month: 2, 
    icon: "🌱",
    activities: [
      "Fametrahana voa na zava-boary", 
      "Famandoavana ny tany", 
      "Fanaovana lavabary", 
      "Famonoana ahidratsy voalohany", 
      "Famindrana zava-boary"
    ]
  },
  { 
    month: 3, 
    icon: "🐛",
    activities: [
      "Famonoana ahidratsy", 
      "Fanaronana ny voly", 
      "Fametan-javamaniry", 
      "Fandaviana aretina sy bibikely", 
      "Famakiana ny toetr'andro"
    ]
  },
  { 
    month: 4, 
    icon: "🌞",
    activities: [
      "Famonoana ahidratsy mafy", 
      "Fiarovana ny voly amin'ny tara-masoandro", 
      "Famindrana zezika fanampiny", 
      "Fikojakojana ny rano", 
      "Fijerena ny fivoaran'ny voly"
    ]
  },
  { 
    month: 5, 
    icon: "🌾",
    activities: [
      "Fijinjana ny vokatra lehibe", 
      "Famokarana koba", 
      "Fanangonana voankazo", 
      "Famonoana biby mpiremby", 
      "Fanomanana ny vokatra ho entina an-tsena"
    ]
  },
  { 
    month: 6, 
    icon: "🏮",
    activities: [
      "Famongorana ny vokatra", 
      "Famadiñana sy fanamainana", 
      "Fitehirizana ny vokatra", 
      "Fivarotana ny vokatra", 
      "Fametrahana voly faharoa"
    ]
  },
  { 
    month: 7, 
    icon: "🥬",
    activities: [
      "Fametrahana voly mandritry ny ririnina", 
      "Fikojakojana ny zaridaina", 
      "Famaranana ny fijinjana", 
      "Famafazana ny tany", 
      "Fametrahana legioma"
    ]
  },
  { 
    month: 8, 
    icon: "🔄",
    activities: [
      "Famerenana ny herin'ny tany", 
      "Famafazana indray ny tany", 
      "Fanomanana ny tany ho an'ny taona manaraka", 
      "Famokarana zava-boary vaovao", 
      "Fikarakarana ny fitaovana fambolena"
    ]
  },
  { 
    month: 9, 
    icon: "✈️",
    activities: [
      "Fialam-boly", 
      "Fikarakarana ny fitaovana fambolena", 
      "Fametrahana voly fotoana fohy", 
      "Famokarana voa", 
      "Fikarohana tany vaovao"
    ]
  },
  { 
    month: 10, 
    icon: "💧",
    activities: [
      "Famafazana ny ala", 
      "Fanadiovana ny saha", 
      "Fanomanana ny tany", 
      "Fametrahana voly vaovao", 
      "Fikarakarana ny rano"
    ]
  },
  { 
    month: 11, 
    icon: "🎯",
    activities: [
      "Fitantanam-pambolena", 
      "Fikajiana ny vokatra", 
      "Fivarotana ny vokatra sisa", 
      "Fiomanana amin'ny fambolena manaraka", 
      "Fandraisana anjara amin'ny fomba nentim-paharazana"
    ]
  }
];

// Obtenir le nom du jour en malgache
export const getDayNameMalagasy = (dateStr) => {
  const days = ['Alahady', 'Alatsinainy', 'Talata', 'Alarobia', 'Alakamisy', 'Zoma', 'Asabotsy'];
  const date = new Date(dateStr);
  return days[date.getDay()];
};
