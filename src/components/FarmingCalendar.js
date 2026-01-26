import React, { useState } from 'react';
import { 
  Calendar, ChevronRight, ChevronLeft, Sun, CloudRain, 
  Leaf, Sprout, TreePine, Droplets, Thermometer, Wind,
  Clock, AlertCircle, CheckCircle, Target, TrendingUp
} from 'lucide-react';
import { monthsMG, farmingCalendar } from '../utils/constants';

export default function FarmingCalendar({ onMonthClick }) {
  const today = new Date();
  const [currentYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const getSeasonIcon = (monthIndex) => {
    if (monthIndex >= 2 && monthIndex <= 4) return <Sprout className="w-4 h-4 text-emerald-500" />;
    if (monthIndex >= 5 && monthIndex <= 7) return <Sun className="w-4 h-4 text-amber-500" />;
    if (monthIndex >= 8 && monthIndex <= 10) return <Leaf className="w-4 h-4 text-orange-500" />;
    return <CloudRain className="w-4 h-4 text-blue-500" />;
  };

  const getSeasonName = (monthIndex) => {
    if (monthIndex >= 2 && monthIndex <= 4) return { name: 'Fararano', color: 'from-emerald-500 to-green-500' };
    if (monthIndex >= 5 && monthIndex <= 7) return { name: 'Ririnina', color: 'from-amber-500 to-orange-500' };
    if (monthIndex >= 8 && monthIndex <= 10) return { name: 'Lohataona', color: 'from-orange-500 to-red-500' };
    return { name: 'Fahavaratra', color: 'from-blue-500 to-indigo-500' };
  };

  const handleMonthClick = (monthIndex) => {
    setSelectedMonth(monthIndex);
    if (onMonthClick) onMonthClick(monthIndex);
  };

  const currentMonthData = farmingCalendar[selectedMonth];
  const season = getSeasonName(selectedMonth);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold drop-shadow-lg">Kalandrie Fambolena</h2>
              <p className="text-white/90 text-sm sm:text-base">Fijerena ny asa tokony hatao isam-bolana</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-sm font-medium">
              {currentYear}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
              >
                <div className="grid grid-cols-2 gap-1 w-5 h-5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-sm"></div>
                  ))}
                </div>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
              >
                <div className="space-y-1 w-5 h-5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white h-1 rounded-full"></div>
                  ))}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Season Indicator */}
        <div className="mt-6 bg-gradient-to-r from-white/10 to-transparent backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r bg-white/20 p-3 rounded-xl">
                {getSeasonIcon(selectedMonth)}
              </div>
              <div>
                <p className="text-white/80 text-sm">Toetr'andro ankehitriny</p>
                <h3 className="text-xl font-bold">{monthsMG[selectedMonth]} - {season.name}</h3>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{currentMonthData.icon}</div>
              <p className="text-white/80 text-sm">{currentMonthData.activities.length} asa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Months Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Safidy ny Volana</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span>Volana ankehitriny</span>
          </div>
        </div>

        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1'} gap-3 sm:gap-4`}>
          {farmingCalendar.map((item, idx) => {
            const isSelected = idx === selectedMonth;
            const isCurrentMonth = idx === today.getMonth();
            const itemSeason = getSeasonName(idx);

            return (
              <button
                key={idx}
                onClick={() => handleMonthClick(idx)}
                className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                  isSelected
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl border-2 border-emerald-400'
                    : 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 hover:border-emerald-200'
                }`}
              >
                {/* Background pattern for non-selected */}
                {!isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-gradient-to-br from-emerald-50 to-green-50'}`}>
                      <span className={`text-xl sm:text-2xl ${isSelected ? 'text-white' : 'text-emerald-600'}`}>
                        {item.icon}
                      </span>
                    </div>
                    {isCurrentMonth && !isSelected && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    )}
                  </div>

                  <div>
                    <div className={`text-base sm:text-lg font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                      {monthsMG[item.month].substring(0, 3)}
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeasonIcon(idx)}
                      <span className={`text-xs ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                        {getSeasonName(idx).name}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
                  )}
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Month Details */}
      <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-2xl shadow-lg">
                  <span className="text-3xl text-white">{currentMonthData.icon}</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Volana {monthsMG[selectedMonth]}</h3>
                <p className="text-emerald-600 font-medium">
                  {currentMonthData.activities.length} asa tokony hatao
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full border border-emerald-200">
                <span className="text-emerald-700 font-medium text-sm flex items-center gap-2">
                  {getSeasonIcon(selectedMonth)}
                  {season.name}
                </span>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="font-medium">Mametraka tanjona</span>
              </button>
            </div>
          </div>

          {/* Activities List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Asa tokony hatao
              </h4>
              
              <div className="space-y-3">
                {currentMonthData.activities.map((activity, idx) => (
                  <div 
                    key={idx}
                    className="group bg-white hover:bg-emerald-50/50 rounded-xl p-4 border border-gray-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-emerald-700 font-bold text-sm">{idx + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed">{activity}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Thermometer className="w-3 h-3" />
                            <span>Maripana antonony</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Droplets className="w-3 h-3" />
                            <span>Hamandoana antonony</span>
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ChevronRight className="w-5 h-5 text-emerald-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Farming Tips & Stats */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-amber-800">Torohevitra</h4>
                    <p className="text-amber-600 text-sm">Fanamarihana manokana ho an'ity volana ity</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                    <span className="text-amber-700 text-sm">Mahazo antoka fa vita ny fambolena alohan'ny hamandoana</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                    <span className="text-amber-700 text-sm">Mametraka zezika organika mba hanatsarana ny tany</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                    <span className="text-amber-700 text-sm">Hanara-maso ny bibikely sy aretina isan'andro</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-800">Statistika</h4>
                    <p className="text-blue-600 text-sm">Ny mety ho vokatra ho an'ity volana ity</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-blue-700 mb-1">
                      <span>Vokatra mety ho azo</span>
                      <span className="font-bold">85%</span>
                    </div>
                    <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-emerald-700 mb-1">
                      <span>Fahombiazana</span>
                      <span className="font-bold">92%</span>
                    </div>
                    <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-t border-emerald-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-emerald-700">
              <span className="font-medium">ZAVA-DEHIBE:</span> Manaraka ny kalandrie mba hahazoana vokatra tsara.
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Manonta ny kalandrie</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => handleMonthClick(selectedMonth > 0 ? selectedMonth - 1 : 11)}
          className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:border-gray-300 text-gray-700 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Volana teo aloha</span>
        </button>
        
        <div className="text-center">
          <div className="text-sm text-gray-600">Fanitsiana ny kalandrie</div>
          <div className="text-lg font-bold text-gray-800">{currentYear}</div>
        </div>
        
        <button 
          onClick={() => handleMonthClick(selectedMonth < 11 ? selectedMonth + 1 : 0)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-medium"
        >
          <span>Volana manaraka</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}