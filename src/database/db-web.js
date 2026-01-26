// Base de données pour le WEB avec IndexedDB
const DB_NAME = 'TantsahaConnectDB';
const DB_VERSION = 1;

let db = null;

// ==================== INITIALISATION ====================
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      console.log('✅ IndexedDB initialisée');
      resolve();
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      // Créer les object stores (équivalent des tables)
      if (!db.objectStoreNames.contains('journal_entries')) {
        const journalStore = db.createObjectStore('journal_entries', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        journalStore.createIndex('date', 'date', { unique: false });
        journalStore.createIndex('created_at', 'created_at', { unique: false });
      }

      if (!db.objectStoreNames.contains('alerts')) {
        db.createObjectStore('alerts', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('farming_advice')) {
        db.createObjectStore('farming_advice', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('weather_cache')) {
        const weatherStore = db.createObjectStore('weather_cache', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        weatherStore.createIndex('location', 'location', { unique: true });
      }

      console.log('✅ Object stores créés');
    };
  });
};

// ==================== RÉINITIALISATION ====================
export const resetDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close();
    }
    
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
    
    deleteRequest.onsuccess = () => {
      console.log('✅ Base de données supprimée');
      initDatabase()
        .then(() => seedFarmingAdvice())
        .then(() => {
          console.log('✅ Base de données recréée');
          resolve();
        })
        .catch(reject);
    };
    
    deleteRequest.onerror = () => {
      console.error('❌ Erreur suppression DB');
      reject(deleteRequest.error);
    };
  });
};

// ==================== JOURNAL CRUD ====================
export const addJournalEntry = (type, crop = '', note = '') => {
  return new Promise((resolve, reject) => {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('mg-MG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const created_at = Date.now();

    const entry = { type, crop, note, date, time, created_at };
    
    const transaction = db.transaction(['journal_entries'], 'readwrite');
    const store = transaction.objectStore('journal_entries');
    const request = store.add(entry);

    request.onsuccess = () => {
      resolve({ ...entry, id: request.result });
    };
    request.onerror = () => reject(request.error);
  });
};

export const getJournalEntries = (limit = 50) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journal_entries'], 'readonly');
    const store = transaction.objectStore('journal_entries');
    const index = store.index('created_at');
    const request = index.openCursor(null, 'prev'); // Ordre décroissant

    const entries = [];
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor && entries.length < limit) {
        entries.push(cursor.value);
        cursor.continue();
      } else {
        resolve(entries);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteJournalEntry = (id) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journal_entries'], 'readwrite');
    const store = transaction.objectStore('journal_entries');
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

export const clearAllJournalEntries = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journal_entries'], 'readwrite');
    const store = transaction.objectStore('journal_entries');
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// ==================== ALERTES CRUD ====================
export const addAlert = (type, crop, date, icon = '🌾') => {
  return new Promise((resolve, reject) => {
    const alert = { type, crop, date, icon, created_at: Date.now() };
    
    const transaction = db.transaction(['alerts'], 'readwrite');
    const store = transaction.objectStore('alerts');
    const request = store.add(alert);

    request.onsuccess = () => resolve({ ...alert, id: request.result });
    request.onerror = () => reject(request.error);
  });
};

export const getAlerts = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['alerts'], 'readonly');
    const store = transaction.objectStore('alerts');
    const request = store.getAll();

    request.onsuccess = () => {
      const alerts = request.result.sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      resolve(alerts);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteAlert = (id) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['alerts'], 'readwrite');
    const store = transaction.objectStore('alerts');
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// ==================== CONSEILS AGRICOLES ====================
export const seedFarmingAdvice = () => {
  const adviceData = [
    {
      title: 'Vary (Riz)',
      subtitle: 'Fambolena vary',
      icon: '🌾',
      topics: [
        'Famafazana: Volana Septambra-Novambra',
        'Fijinjana: 120-150 andro',
        'Rano: Mila rano be',
        'Tany: Tany lena sy lonaka'
      ]
    },
    {
      title: 'Voanjobory (Haricot)',
      subtitle: 'Legioma',
      icon: '🫘',
      topics: [
        'Famafazana: Volana Oktobra-Desambra',
        'Fijinjana: 60-90 andro',
        'Tany: Tsy mila rano be',
        'Karazana: Voanjobory fotsy, mena, mainty'
      ]
    },
    {
      title: 'Bibikely (Parasites)',
      subtitle: 'Ady amin\'ny bibikely',
      icon: '🐛',
      topics: [
        'Jereo ny ravina isan-kerinandro',
        'Ampiasao fanafody voajanahary',
        'Diovana ny tany',
        'Famafazana zavamaniry fiarovan-tena'
      ]
    },
    {
      title: 'Tsaramaso (Pois du Cap)',
      subtitle: 'Voankazo proteina',
      icon: '🌱',
      topics: [
        'Famafazana: Oktobra-Desambra',
        'Fijinjana: 90-120 andro',
        'Manatsara ny tany (azote)',
        'Tsy dia mila zezika be'
      ]
    },
    {
      title: 'Ovy (Patate douce)',
      subtitle: 'Voankazo foto-pivelomana',
      icon: '🍠',
      topics: [
        'Famafazana: Septambra-Novambra',
        'Fijinjana: 120-150 andro',
        'Tany: Tany maivana sy malama',
        'Tsy mila rano be loatra'
      ]
    },
    {
      title: 'Katsaka (Maïs)',
      subtitle: 'Varimbazaha',
      icon: '🌽',
      topics: [
        'Famafazana: Oktobra-Desambra',
        'Fijinjana: 90-120 andro',
        'Tany: Tany manankarena organika',
        'Rano: Mila rano am-pahanterana'
      ]
    },
    {
      title: 'Voanjo (Arachide)',
      subtitle: 'Voankazo proteina',
      icon: '🥜',
      topics: [
        'Famafazana: Oktobra-Novambra',
        'Fijinjana: 90-120 andro',
        'Tany: Tany tsy lena loatra',
        'Manatsara ny tany (azote)'
      ]
    },
    {
      title: 'Tongolo (Oignon)',
      subtitle: 'Legioma anisan\'ny sakafo',
      icon: '🧅',
      topics: [
        'Famafazana: Aprily-Mey',
        'Fijinjana: 90-120 andro',
        'Tany: Tany malama sy tsy lena',
        'Rano: Fandena tsy tapaka'
      ]
    },
    {
      title: 'Takarama (Tomate)',
      subtitle: 'Legioma be mpampiasa',
      icon: '🍅',
      topics: [
        'Famafazana: Mey-Jolay',
        'Fijinjana: 90-120 andro',
        'Mila rano ara-dalàna',
        'Fiarovana amin\'ny bibikely'
      ]
    },
    {
      title: 'Saonjo (Carotte)',
      subtitle: 'Legioma fototra',
      icon: '🥕',
      topics: [
        'Famafazana: Aprily-Aogositra',
        'Fijinjana: 70-90 andro',
        'Tany: Tany malama sy lalina',
        'Rano: Fandena tsy tapaka'
      ]
    },
    {
      title: 'Kabeja (Chou)',
      subtitle: 'Legioma ravina',
      icon: '🥬',
      topics: [
        'Famafazana: Mey-Jolay',
        'Fijinjana: 80-100 andro',
        'Tany: Tany manankarena',
        'Zezika: Mila zezika be'
      ]
    },
    {
      title: 'Manga (Mangue)',
      subtitle: 'Hazo fihinam-boa',
      icon: '🥭',
      topics: [
        'Fambolena: Septambra-Novambra',
        'Vokatra: Afaka 3-5 taona',
        'Tany: Tany tsy lena loatra',
        'Rano: Mila rano mandritra ny fahavaratra'
      ]
    },
    {
      title: 'Akondro (Banane)',
      subtitle: 'Zavamaniry tropikaly',
      icon: '🍌',
      topics: [
        'Fambolena: Mandritra ny taona',
        'Vokatra: Afaka 9-12 volana',
        'Tany: Tany manankarena organika',
        'Rano: Mila rano tsy tapaka'
      ]
    },
    {
      title: 'Paiso (Papaye)',
      subtitle: 'Hazo voankazo haingana',
      icon: '🍈',
      topics: [
        'Famafazana: Oktobra-Desambra',
        'Vokatra: Afaka 6-9 volana',
        'Tany: Tany tsy lena',
        'Rano: Fandena ara-dalàna'
      ]
    },
    {
      title: 'Voatabia (Ananas)',
      subtitle: 'Voankazo tropikaly',
      icon: '🍍',
      topics: [
        'Fambolena: Mandritra ny taona',
        'Vokatra: Afaka 18-24 volana',
        'Tany: Tany malama sy tsy lena',
        'Rano: Tsy mila rano be'
      ]
    },
    {
      title: 'Jirofo (Girofle)',
      subtitle: 'Zavamaniry fanafody',
      icon: '🌿',
      topics: [
        'Fambolena: Fahavaratra',
        'Vokatra: Afaka 4-5 taona',
        'Tany: Tany manankarena',
        'Toeram-piainana: Toerana alokaloka'
      ]
    },
    {
      title: 'Lavanila (Vanille)',
      subtitle: 'Zavamaniry sarobidy',
      icon: '🌺',
      topics: [
        'Fambolena: Oktobra-Desambra',
        'Vokatra: Afaka 3 taona',
        'Tany: Tany manankarena organika',
        'Fikarakarana: Mila fikarakarana be'
      ]
    },
    {
      title: 'Kafe (Café)',
      subtitle: 'Hazo kafe',
      icon: '☕',
      topics: [
        'Fambolena: Fahavaratra',
        'Vokatra: Afaka 3-4 taona',
        'Tany: Tany alokaloka',
        'Toeram-piainana: Faritra avo'
      ]
    },
    {
      title: 'Voanio (Coco)',
      subtitle: 'Hazo moramora',
      icon: '🥥',
      topics: [
        'Fambolena: Mandritra ny taona',
        'Vokatra: Afaka 5-7 taona',
        'Tany: Tany amoron-dranomasina',
        'Rano: Tsy dia mila rano be'
      ]
    },
    {
      title: 'Menaka (Arachide oleagineuse)',
      subtitle: 'Voa menaka',
      icon: '🌻',
      topics: [
        'Famafazana: Oktobra-Novambra',
        'Fijinjana: 100-130 andro',
        'Tany: Tany tsy lena',
        'Famokarana: Menaka sy sakafon\'omby'
      ]
    },
    {
      title: 'Zezika Voajanahary',
      subtitle: 'Famokarana zezika',
      icon: '♻️',
      topics: [
        'Fanangonam-pako organika',
        'Famokarana kompositra',
        'Fampiasana fako biby',
        'Fanatsarana ny tany'
      ]
    },
    {
      title: 'Fitantanana Rano',
      subtitle: 'Fitsitsiana rano',
      icon: '💧',
      topics: [
        'Fananganana lavaka rano',
        'Fandena ara-dalàna',
        'Fitahirizana rano orana',
        'Fampiasana rano tsara'
      ]
    },
    {
      title: 'Fiarovana ny Tontolo',
      subtitle: 'Fanajana ny natiora',
      icon: '🌍',
      topics: [
        'Tsy fandoroana ala',
        'Fambolena hazo',
        'Fitantanana ny tany',
        'Fiarovana ny zavaboary'
      ]
    }
  ];

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['farming_advice'], 'readwrite');
    const store = transaction.objectStore('farming_advice');
    
    // VIDER COMPLÈTEMENT LA TABLE D'ABORD
    const clearRequest = store.clear();
    
    clearRequest.onsuccess = () => {
      console.log('✅ Table farming_advice vidée');
      
      // Puis insérer toutes les nouvelles données
      let insertCount = 0;
      adviceData.forEach((advice) => {
        const addRequest = store.add(advice);
        addRequest.onsuccess = () => {
          insertCount++;
          if (insertCount === adviceData.length) {
            console.log(`✅ ${adviceData.length} conseils agricoles insérés`);
            resolve();
          }
        };
        addRequest.onerror = (e) => {
          console.error('❌ Erreur insertion:', e);
        };
      });
    };
    
    clearRequest.onerror = () => {
      console.error('❌ Erreur clear:', clearRequest.error);
      reject(clearRequest.error);
    };
  });
};

export const getFarmingAdvice = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['farming_advice'], 'readonly');
    const store = transaction.objectStore('farming_advice');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// ==================== CACHE MÉTÉO ====================
export const saveWeatherCache = (location, weatherData, forecastData) => {
  return new Promise((resolve, reject) => {
    const cache = {
      location,
      weather_data: weatherData,
      forecast_data: forecastData,
      last_sync: Date.now()
    };

    const transaction = db.transaction(['weather_cache'], 'readwrite');
    const store = transaction.objectStore('weather_cache');
    const index = store.index('location');
    
    // Supprimer l'ancien cache
    const getRequest = index.getKey(location);
    
    getRequest.onsuccess = () => {
      if (getRequest.result) {
        store.delete(getRequest.result);
      }
      
      // Ajouter le nouveau cache
      const addRequest = store.add(cache);
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};

export const getWeatherCache = (location) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['weather_cache'], 'readonly');
    const store = transaction.objectStore('weather_cache');
    const index = store.index('location');
    const request = index.get(location);

    request.onsuccess = () => {
      if (request.result) {
        resolve({
          weather: request.result.weather_data,
          forecast: request.result.forecast_data,
          lastSync: request.result.last_sync
        });
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const clearWeatherCache = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['weather_cache'], 'readwrite');
    const store = transaction.objectStore('weather_cache');
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export default db;
