import React from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import FarmingCalendar from '../components/FarmingCalendar';
import VoiceButton from '../components/VoiceButton';
import ActionButton from '../components/ActionButton';
import { speakText } from '../utils/speech';

export default function JournalScreen({ 
  journalEntries, 
  onMonthClick,
  onDeleteEntry 
}) {
  const getScreenText = () => {
    let text = "Tatitra amin'ny fambolena. ";
    text += journalEntries.map(
      (entry) => `${entry.date}. ${entry.crop || ""}. `
    ).join(" ");
    return text;
  };

  const getEntryIcon = (type) => {
    switch(type) {
      case 'semis': return '🌱';
      case 'pluie': return '🌧️';
      case 'recolte': return '🌾';
      case 'ravageur': return '🐛';
      default: return '📝';
    }
  };

  const getEntryLabel = (type) => {
    switch(type) {
      case 'semis': return 'Famafazana';
      case 'pluie': return 'Orana';
      case 'recolte': return 'Fijinjana';
      case 'ravageur': return 'Bibikely';
      default: return 'Fanamarihana';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
        <FarmingCalendar onMonthClick={onMonthClick} />

      <VoiceButton 
        onClick={() => speakText(getScreenText(), "fr-FR")}
        disabled={journalEntries.length === 0}
      />
    </div>
    </div>

  );
}
