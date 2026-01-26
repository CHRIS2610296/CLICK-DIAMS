import React, { useState } from 'react';
import { Book, ChevronLeft, ChevronRight, Volume2, Sparkles, Leaf, Droplets, Sun, Trees } from 'lucide-react';
import VoiceButton from '../components/VoiceButton';
import { speakText } from '../utils/speech';

export default function AdviceScreen({ advice }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeCard, setActiveCard] = useState(null);
  const itemsPerPage = 4;

  // Trier par nom
  const sortedAdvice = [...advice].sort((a, b) => 
    a.title.localeCompare(b.title, 'fr-FR')
  );

  const totalPages = Math.ceil(sortedAdvice.length / itemsPerPage);
  const currentAdvice = sortedAdvice.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setActiveCard(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setActiveCard(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSpeakAdvice = (item) => {
    const text = `${item.title}. ${item.subtitle}. ${item.topics.join('. ')}`;
    speakText(text, "fr-FR");
  };

  const handleSpeakAll = () => {
    const text = currentAdvice.map(item => 
      `${item.title}. ${item.topics.join(', ')}`
    ).join('. ');
    speakText(`Pejy ${currentPage + 1}. ${text}`, "fr-FR");
  };

  // Natural color palette for farmers
  const cardColors = [
    { bg: 'bg-green-50', border: 'border-green-100', icon: 'text-green-600', accent: 'bg-green-100' },
    { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-600', accent: 'bg-amber-100' },
    { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-600', accent: 'bg-blue-100' },
    { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-600', accent: 'bg-emerald-100' },
    { bg: 'bg-brown-50', border: 'border-brown-100', icon: 'text-brown-600', accent: 'bg-brown-100' },
  ];

  // Farming-related icons based on category
  const getFarmIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('rano') || lowerTitle.includes('irrigation')) return <Droplets className="w-5 h-5" />;
    if (lowerTitle.includes('voa') || lowerTitle.includes('vokatra')) return <Trees className="w-5 h-5" />;
    if (lowerTitle.includes('masoandro') || lowerTitle.includes('toetr')) return <Sun className="w-5 h-5" />;
    return <Leaf className="w-5 h-5" />;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-green-50/30 to-amber-50/20">

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Stats bar */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-green-100 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{sortedAdvice.length}</div>
              <div className="text-xs text-gray-600">Torohevitra</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-700">{totalPages}</div>
              <div className="text-xs text-gray-600">Pejy</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {Math.ceil(sortedAdvice.length / 4)}
              </div>
              <div className="text-xs text-gray-600">Pejy feno</div>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-700">
                {sortedAdvice.length > 0 ? sortedAdvice[0].topics.length : 0}
              </div>
              <div className="text-xs text-gray-600">Vola tsirairay</div>
            </div>
          </div>
        </div>

        {/* Advice cards in clean grid */}
        {currentAdvice.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentAdvice.map((item, index) => {
              const colors = cardColors[index % cardColors.length];
              const isActive = activeCard === item.id;
              
              return (
                <div
                  key={item.id}
                  className={`relative transition-all duration-300 ${
                    isActive ? 'md:col-span-2' : ''
                  }`}
                >
                  <div 
                    className={`${colors.bg} ${colors.border} rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                      isActive ? 'ring-2 ring-green-300' : ''
                    }`}
                  >
                    {/* Card header */}
                    <div 
                      className="p-5 cursor-pointer"
                      onClick={() => {
                        setActiveCard(isActive ? null : item.id);
                        handleSpeakAdvice(item);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`${colors.accent} p-3 rounded-xl`}>
                            <div className={colors.icon}>
                              {getFarmIcon(item.title)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                                #{currentPage * itemsPerPage + index + 1}
                              </span>
                              <span className="text-xs text-gray-500">
                                {item.subtitle || 'Torohevitra fambolena'}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSpeakAdvice(item);
                                }}
                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-700 transition-colors"
                              >
                                <Volume2 className="w-4 h-4" />
                                <span>Hihaino</span>
                              </button>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-500">
                                {item.topics.length} vola
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setActiveCard(isActive ? null : item.id)}
                          className={`p-2 rounded-lg transition-all ${
                            isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          <ChevronRight className={`w-5 h-5 transition-transform ${
                            isActive ? 'rotate-90' : ''
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable content */}
                    <div className={`overflow-hidden transition-all duration-500 ${
                      isActive ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="border-t border-gray-100">
                        <div className="p-5">
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              Vola fototra
                            </h4>
                          </div>
                          
                          <div className="space-y-3">
                            {item.topics.map((tip, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100"
                              >
                                <div className={`${colors.accent} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                  <span className={`${colors.icon} font-bold`}>{idx + 1}</span>
                                </div>
                                <p className="text-gray-700 leading-relaxed flex-1">
                                  {tip}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <button
                              onClick={() => handleSpeakAdvice(item)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                            >
                              <Volume2 className="w-4 h-4" />
                              <span className="font-medium">Hihaino indray</span>
                            </button>
                            <div className="text-xs text-gray-500">
                              Tapaka ny torohevitra
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-2xl bg-green-50 mb-6">
              <Book className="w-16 h-16 text-green-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Tsy misy torohevitra
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              Miandry ny torohevitra vaovao momba ny fambolena sy ny fikojakojana
            </p>
            <button className="px-6 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors">
              Mila fanampiana?
            </button>
          </div>
        )}

        {/* Clean pagination */}
        {totalPages > 1 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Manomboka {currentPage * itemsPerPage + 1} - {Math.min((currentPage + 1) * itemsPerPage, sortedAdvice.length)} amin'ny {sortedAdvice.length}
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentPage === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="font-medium">Teo aloha</span>
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium transition-all ${
                        idx === currentPage
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentPage === totalPages - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                  }`}
                >
                  <span className="font-medium">Manaraka</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating action button for voice */}
      <div className="sticky bottom-4 px-4 sm:px-6">
        <div className="flex justify-center">
          <VoiceButton 
            onClick={handleSpeakAll}
            disabled={currentAdvice.length === 0}
            className="shadow-lg hover:shadow-xl transition-shadow"
          />
        </div>
      </div>

      {/* Simple bottom navigation */}
      <div className="border-t border-gray-100 bg-white p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-green-700 transition-colors">
            <Leaf className="w-5 h-5" />
            <span className="text-sm font-medium">Torohevitra</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-green-700 transition-colors">
            <Sun className="w-5 h-5" />
            <span className="text-sm font-medium">Toetrandro</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-green-700 transition-colors">
            <Droplets className="w-5 h-5" />
            <span className="text-sm font-medium">Rano</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-green-700 transition-colors">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Soso-kevitra</span>
          </button>
        </div>
      </div>
    </div>
  );
}