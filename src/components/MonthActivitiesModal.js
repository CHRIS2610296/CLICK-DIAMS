import React from 'react';
import { Calendar, Volume2 } from 'lucide-react';
import { monthsMG, farmingCalendar } from '../utils/constants';
import { speakText } from '../utils/speech';

export default function MonthActivitiesModal({ monthIndex, onClose }) {
  const activities = farmingCalendar[monthIndex]?.activities || [];
  const monthName = monthsMG[monthIndex];
  const icon = farmingCalendar[monthIndex]?.icon || "📅";
  const voiceText = `Asa ho atao amin'ny volana ${monthName}: ${activities.join(", ")}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-2xl sm:text-3xl text-gray-400 hover:text-red-600 font-bold transition-colors hover:scale-110"
        >
          ×
        </button>
        
        <div className="flex items-center mb-4 sm:mb-6 gap-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 sm:p-3 rounded-lg sm:rounded-xl">
            <span className="text-xl sm:text-2xl">{icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-gray-800">{monthName}</h3>
            <p className="text-gray-600 text-xs sm:text-sm">Asa fambolena mahasoa</p>
          </div>
        </div>
        
        <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm sm:text-base">Tsy misy asa manokana</p>
            </div>
          ) : (
            activities.map((activity, idx) => (
              <div 
                key={idx} 
                className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-start gap-3 group"
              >
                <div className="bg-green-100 text-green-700 p-1 sm:p-2 rounded-md sm:rounded-lg group-hover:scale-110 transition-transform">
                  <span className="font-bold text-sm">{idx + 1}</span>
                </div>
                <span className="text-gray-700 text-sm sm:text-base leading-relaxed flex-1">{activity}</span>
              </div>
            ))
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => speakText(voiceText, "fr-FR")}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-bold text-sm sm:text-base">Vakio</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            <span className="font-medium">Hidy</span>
          </button>
        </div>
      </div>
    </div>
  );
}
