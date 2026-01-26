import React, { useState } from 'react';
import { Home, Calendar, Book, CloudSun, Bell, User, Menu, X, TreePine, ChevronRight } from 'lucide-react';
import AlertModal from './AlertModal';

export default function Header({ currentScreen, onNavigate, weather }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const navItems = [
    { id: 'home', label: 'Fandaraisana', icon: <Home className="w-5 h-5" /> },
    { id: 'weather', label: 'Toetr\'andro', icon: <CloudSun className="w-5 h-5" /> },
    { id: 'journal', label: 'Firaketana', icon: <Calendar className="w-5 h-5" /> },
    { id: 'advice', label: 'Torohevitra', icon: <Book className="w-5 h-5" /> },
  ];

  const handleNavigate = (screenId) => {
    onNavigate(screenId);
    setShowMobileMenu(false);
  };

  // Vérifier s'il y a des alertes météo
  const hasWeatherAlerts = () => {
    if (!weather || !weather.weather || !weather.wind) return false;
    
    const condition = weather.weather[0]?.main;
    const windSpeed = weather.wind.speed;
    const humidity = weather.main?.humidity;

    return (
      condition === 'Rain' || 
      condition === 'Drizzle' || 
      condition === 'Thunderstorm' || 
      windSpeed > 10 || 
      humidity > 85
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-b from-white/95 to-white/85 backdrop-blur-xl border-b border-gray-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo et titre */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => onNavigate('home')}
                className="group relative p-2 rounded-xl hover:bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <TreePine className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
              </button>
              
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                  Tantsaha Connect
                </h1>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Fampandrosoana ny Fambolena Malagasy</p>
              </div>
              
              <div className="sm:hidden">
                <h1 className="text-base font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Tantsaha Connect
                </h1>
              </div>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                    currentScreen === item.id
                      ? 'text-white shadow-lg'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white/60 hover:shadow-md'
                  }`}
                >
                  {currentScreen === item.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl -z-10"></div>
                  )}
                  <span className={`transition-transform duration-300 group-hover:scale-110 ${
                    currentScreen === item.id ? 'text-white' : 'text-green-600'
                  }`}>
                    {item.icon}
                  </span>
                  <span className="relative">{item.label}</span>
                  {currentScreen !== item.id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 group-hover:w-4/5 transition-all duration-300"></div>
                  )}
                </button>
              ))}
            </nav>

            {/* Actions côté droit */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Bouton d'alerte */}
              <button 
                onClick={() => setShowAlertModal(true)}
                className="relative p-2.5 rounded-xl hover:bg-orange-50 transition-all duration-300 group hover:shadow-md"
              >
                <Bell className={`w-5 h-5 transition-colors duration-300 ${
                  hasWeatherAlerts() 
                    ? 'text-orange-600 animate-pulse' 
                    : 'text-gray-600 group-hover:text-orange-600'
                }`} />
                {hasWeatherAlerts() && (
                  <>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-ping"></span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                  </>
                )}
                {!hasWeatherAlerts() && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></span>
                )}
              </button>

              <button className="p-2.5 rounded-xl hover:bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-300 group hover:shadow-md">
                <User className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors duration-300 group-hover:scale-110" />
              </button>
              
              {/* Menu mobile */}
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2.5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 hover:shadow-md ml-2"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5 text-green-600" />
                ) : (
                  <Menu className="w-5 h-5 text-green-600" />
                )}
              </button>
            </div>
          </div>

          {/* Menu mobile déroulant */}
          {showMobileMenu && (
            <div className="md:hidden bg-gradient-to-b from-white to-gray-50/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl rounded-b-2xl animate-slideDown overflow-hidden">
              <div className="flex flex-col space-y-0.5 py-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`relative flex items-center gap-4 px-5 py-3.5 text-sm font-semibold transition-all duration-300 group ${
                      currentScreen === item.id
                        ? 'text-white'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {currentScreen === item.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 -z-10"></div>
                    )}
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      currentScreen === item.id 
                        ? 'bg-white/20' 
                        : 'bg-gradient-to-br from-green-50 to-emerald-50 group-hover:from-green-100 group-hover:to-emerald-100'
                    }`}>
                      {React.cloneElement(item.icon, {
                        className: `${currentScreen === item.id ? 'text-white' : 'text-green-600'} w-5 h-5`
                      })}
                    </div>
                    <span>{item.label}</span>
                    {currentScreen === item.id && (
                      <ChevronRight className="w-5 h-5 ml-auto animate-pulse" />
                    )}
                    {currentScreen !== item.id && (
                      <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-300" />
                    )}
                  </button>
                ))}
              </div>
              
              {/* Decorative bottom element */}
              <div className="px-5 py-3 border-t border-gray-100/50">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse delay-75"></div>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Modal d'alertes */}
      {showAlertModal && (
        <AlertModal 
          weather={weather}
          onClose={() => setShowAlertModal(false)}
        />
      )}
    </>
  );
}
