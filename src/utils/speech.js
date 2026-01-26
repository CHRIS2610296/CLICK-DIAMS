// Utilitaire pour la synthèse vocale WEB (Web Speech API)
let isInitialized = false;
let availableVoices = [];

export const initSpeech = () => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.error('❌ Speech Synthesis non supporté');
      resolve(false);
      return;
    }

    const loadVoices = () => {
      availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        console.log('✅ Voix disponibles:', availableVoices.length);
        console.log('Voix:', availableVoices.map(v => `${v.name} (${v.lang})`).slice(0, 5));
        isInitialized = true;
        resolve(true);
      }
    };

    // Charger les voix immédiatement
    loadVoices();
    
    // Écouter l'événement de chargement des voix (nécessaire pour Chrome)
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Timeout si les voix ne se chargent pas
    setTimeout(() => {
      if (!isInitialized) {
        console.warn('⚠️ Voix pas encore chargées, utilisation des voix par défaut');
        resolve(true);
      }
    }, 1000);
  });
};

export function speakText(text, lang = "fr-FR") {
  if (!text || text.trim() === '') {
    console.warn('⚠️ Texte vide');
    return;
  }

  if (!('speechSynthesis' in window)) {
    console.error('❌ Speech Synthesis non supporté');
    alert('Synthèse vocale non supportée. Utilisez Chrome, Firefox ou Edge.');
    return;
  }

  try {
    // Arrêter toute lecture en cours
    window.speechSynthesis.cancel();

    // Créer l'utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Vitesse (0.1 à 10)
    utterance.pitch = 1.0; // Tonalité (0 à 2)
    utterance.volume = 1.0; // Volume (0 à 1)

    // Trouver une voix appropriée
    const voices = window.speechSynthesis.getVoices();
    
    // Chercher d'abord une voix française
    let selectedVoice = voices.find(voice => 
      voice.lang.toLowerCase().startsWith('fr')
    );

    // Sinon prendre la première voix disponible
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('🎙️ Voix:', selectedVoice.name, selectedVoice.lang);
    }

    // Événements
    utterance.onstart = () => {
      console.log('🔊 Début lecture:', text.substring(0, 50) + '...');
    };

    utterance.onend = () => {
      console.log('✅ Fin lecture');
    };

    utterance.onerror = (event) => {
      console.error('❌ Erreur TTS:', event.error);
    };

    // Lire le texte
    window.speechSynthesis.speak(utterance);

  } catch (error) {
    console.error('❌ Erreur speakText:', error);
  }
}

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    console.log('⏹️ Lecture arrêtée');
  }
};

export const pauseSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.pause();
    console.log('⏸️ Lecture en pause');
  }
};

export const resumeSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.resume();
    console.log('▶️ Lecture reprise');
  }
};

// Obtenir les voix disponibles
export const getAvailableVoices = () => {
  if ('speechSynthesis' in window) {
    return window.speechSynthesis.getVoices();
  }
  return [];
};
