import React from 'react';
import { Volume2 } from 'lucide-react';

export default function VoiceButton({ onClick, disabled = false }) {
  return (
    <button
      className={`fixed bottom-24 sm:bottom-8 right-4 sm:right-6 md:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all z-50 ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
      }`}
      onClick={onClick}
      disabled={disabled}
      title="Vakio ny pejy"
      aria-label="Voice assistant"
    >
      <div className="relative">
        <Volume2 className="w-6 h-6 sm:w-7 sm:h-7" />
        {!disabled && (
          <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></span>
        )}
      </div>
      
      {!disabled && (
        <>
          <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-40"></span>
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-30 animate-pulse"></span>
        </>
      )}
    </button>
  );
}
