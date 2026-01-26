import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Shield, Target, Bell, 
  CloudSun, Calendar, Book, BarChart3, TreePine, 
  Leaf, Sprout, Wheat, Zap, MapPin, Droplets,
  CloudRain, Sun, Wind, Thermometer, ChevronRight
} from 'lucide-react';
import { getWeatherIcon } from '../utils/weatherIcons';

// Hero background images
const heroImages = [
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505253668822-42074d58a7c6?q=80&w=2069&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2070&auto=format&fit=crop'
];

// Stat card background images
const statImages = {
  productivity: 'https://images.unsplash.com/photo-1589923186741-b7d59d6b2c4c?q=80&w=2070&auto=format&fit=crop',
  community: 'https://images.unsplash.com/photo-1537511446972-6374a7b95eb0?q=80&w=2070&auto=format&fit=crop',
  success: 'https://images.unsplash.com/photo-1589923186741-b7d59d6b2c4c?q=80&w=2070&auto=format&fit=crop',
  farmers: 'https://images.unsplash.com/photo-1589923186741-b7d59d6b2c4c?q=80&w=2070&auto=format&fit=crop'
};

// Action button background images
const actionImages = {
  weather: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?q=80&w=2070&auto=format&fit=crop',
  journal: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop',
  advice: 'https://images.unsplash.com/photo-1599164091274-8e4e81c61b3a?q=80&w=2070&auto=format&fit=crop',
  stats: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop'
};

// Weather background based on condition
const getWeatherBackground = (condition) => {
  const backgrounds = {
    Clear: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop',
    Clouds: 'https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=2070&auto=format&fit=crop',
    Rain: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=2070&auto=format&fit=crop',
    Thunderstorm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=2070&auto=format&fit=crop',
    Snow: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2070&auto=format&fit=crop'
  };
  return backgrounds[condition] || 'https://images.unsplash.com/photo-1592210454359-9043f067919b?q=80&w=2070';
};

export default function HomeScreen({ 
  weather, 
  alerts, 
  stats, 
  city, 
  onNavigate 
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // StatCard Component with Image Background
  const StatCard = ({ icon, value, label, color = 'green', trend, backgroundImage }) => (
    <div className="relative overflow-hidden rounded-2xl group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${
            color === 'green' ? 'from-green-900/70 to-emerald-900/60' :
            color === 'blue' ? 'from-blue-900/70 to-sky-900/60' :
            color === 'purple' ? 'from-purple-900/70 to-violet-900/60' :
            'from-orange-900/70 to-amber-900/60'
          }`} />
        </div>
      )}
      
      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30 shadow-lg">
            {React.cloneElement(icon, { className: "w-6 h-6 sm:w-7 sm:h-7 text-white" })}
          </div>
          {trend && (
            <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
              trend > 0 
                ? 'bg-green-500/30 border-green-400/30 text-green-100' 
                : 'bg-red-500/30 border-red-400/30 text-red-100'
            }`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{value}</div>
          <div className="text-white/90 text-sm sm:text-base mt-1">{label}</div>
        </div>
        
        {/* Animated border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );

  // ActionButton Component with Image Background
  const ActionButton = ({ icon, label, onClick, color = 'blue', backgroundImage }) => (
    <button
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl group text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-95"
    >
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${
            color === 'blue' ? 'from-blue-900/70 via-blue-800/60 to-cyan-900/50' :
            color === 'green' ? 'from-green-900/70 via-emerald-900/60 to-teal-900/50' :
            color === 'purple' ? 'from-purple-900/70 via-violet-900/60 to-fuchsia-900/50' :
            'from-orange-900/70 via-amber-900/60 to-yellow-900/50'
          }`} />
        </div>
      )}
      
      <div className="relative p-5 sm:p-6 h-32 sm:h-36 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
            {React.cloneElement(icon, { className: "w-6 h-6 sm:w-7 sm:h-7 text-white" })}
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ChevronRight className="w-5 h-5 text-white/80" />
          </div>
        </div>
        
        <div>
          <div className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">{label}</div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>
    </button>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-900/70 to-teal-800/60"></div>
          </div>
        ))}
        
        {/* Animated elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full -translate-x-16 -translate-y-16 sm:-translate-x-24 sm:-translate-y-24 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-white/10 rounded-full translate-x-20 translate-y-20 sm:translate-x-32 sm:translate-y-32 animate-pulse delay-1000"></div>
        </div>
        
        {/* Navigation dots */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Voir l'image ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="relative z-10 text-center text-white p-8 sm:p-10 h-48 sm:h-64 flex flex-col items-center justify-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 drop-shadow-lg tracking-tight">
            Tantsaha Connect
          </h1>
          <p className="text-base sm:text-lg opacity-90 mb-4 sm:mb-6">
            «Malagasy Mamboly, Malagasy Voky!»
          </p>
          
          <div className="inline-flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500/30 to-emerald-600/30 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/30 group hover:scale-105 transition-transform duration-300">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 group-hover:animate-ping" />
            <span className="text-xs sm:text-sm font-medium">Natokana ho an'i tantsaha !</span>
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-ping"></span>
          </div>
        </div>
      </div>

      {/* Stats Cards with Images */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard 
          icon={<TrendingUp />}
          value={stats?.productivity || "0%"}
          label="Famokarana"
          color="green"
          trend={15}
          backgroundImage={statImages.productivity}
        />
        <StatCard 
          icon={<Users />}
          value={stats?.community || "0"}
          label="Mpikambana"
          color="blue"
          trend={8}
          backgroundImage={statImages.community}
        />
        <StatCard 
          icon={<Target />}
          value={stats?.successRate || "0%"}
          label="Fahombiazana"
          color="purple"
          trend={3}
          backgroundImage={statImages.success}
        />
        <StatCard 
          icon={<Shield />}
          value={stats?.activeFarmers || "0"}
          label="Tantsaha Miasa"
          color="orange"
          trend={12}
          backgroundImage={statImages.farmers}
        />
      </div>

      {/* Alertes with Image Background */}
      {alerts && alerts.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl group">
          <div 
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=2070&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/70 via-amber-900/60 to-yellow-900/50"></div>
          </div>
          
          <div className="relative p-5 sm:p-6">
            <div className="flex items-center mb-4 sm:mb-5">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full mr-4 border border-white/30 shadow-lg">
                <Bell className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg sm:text-xl drop-shadow-lg">Fampitandremana</h3>
                <p className="text-white/90 text-sm sm:text-base">Andro mety hiasana ankehitriny</p>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {alerts.map(alert => (
                <div 
                  key={alert.id} 
                  className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/30 flex items-center gap-3 hover:bg-white/25 transition-all duration-300 group/alert"
                >
                  <div className="bg-white/30 p-3 rounded-lg">
                    <span className="text-2xl">{alert.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-base">{alert.crop}</div>
                    <div className="text-white/80 text-sm">
                      {alert.type === 'semis' ? 'Andro famafazana' : 'Andro fijinjana'}
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30 group-hover/alert:scale-105 transition-transform duration-300">
                    <span className="font-bold text-white text-sm">{alert.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weather Section with Dynamic Background */}
      {weather && weather.main && (
        <div className="relative overflow-hidden rounded-2xl group">
          <div 
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
            style={{
              backgroundImage: `url(${getWeatherBackground(weather.weather?.[0]?.main)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-cyan-900/60 to-sky-900/50"></div>
          </div>
          
          <div className="relative p-6 sm:p-8 text-white">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold drop-shadow-lg">Toetr'andro Androany</h3>
                <p className="opacity-95 text-base sm:text-lg flex items-center gap-2 mt-2">
                  <MapPin className="w-5 h-5" />
                  {city || "Tanàna"}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full border border-white/30 shadow-lg">
                {getWeatherIcon(weather.weather?.[0]?.main || "Clear", "w-10 h-10 sm:w-12 sm:h-12")}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
              <div className="text-center">
                <div className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight drop-shadow-lg">
                  {Math.round(weather.main.temp)}°C
                </div>
                <div className="opacity-95 text-base sm:text-lg mt-2">Hafanana</div>
              </div>
              
              <div className="hidden sm:block h-20 w-px bg-white/30"></div>
              <div className="sm:hidden w-20 h-px bg-white/30 my-4"></div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full shadow-lg">
                    <Droplets className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <span className="text-5xl sm:text-6xl font-bold drop-shadow-lg">{weather.main.humidity}%</span>
                </div>
                <div className="opacity-95 text-base sm:text-lg">Hamandoana</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons with Images */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <ActionButton
          icon={<CloudSun />}
          label="Toetr'andro"
          onClick={() => onNavigate('weather')}
          color="blue"
          backgroundImage={actionImages.weather}
        />
        <ActionButton
          icon={<Calendar />}
          label="Boky Fambolena"
          onClick={() => onNavigate('journal')}
          color="green"
          backgroundImage={actionImages.journal}
        />
        <ActionButton
          icon={<Book />}
          label="Torohevitra"
          onClick={() => onNavigate('advice')}
          color="purple"
          backgroundImage={actionImages.advice}
        />
        <ActionButton
          icon={<BarChart3 />}
          label="Statistika"
          onClick={() => onNavigate('home')}
          color="orange"
          backgroundImage={actionImages.stats}
        />
      </div>
    </div>
  );
}