import React, { useState } from 'react';
import { RefreshCw, MapPin, Droplets, Wind, Thermometer, Gauge, Sun, Moon, ChevronDown, ChevronUp, Cloud, ThermometerSun, WindIcon, Sunrise, Sunset, Eye } from 'lucide-react';
import WeatherCard from '../components/WeatherCard';
import VoiceButton from '../components/VoiceButton';
import { getWeatherIcon } from '../utils/weatherIcons';
import { getDayNameMalagasy } from '../utils/constants';
import { speakText } from '../utils/speech';

export default function WeatherScreen({ 
  weather, 
  forecast, 
  loading, 
  error, 
  city, 
  cityInput, 
  setCityInput, 
  onFetchWeather,
  onCityChange 
}) {
  const [expandedDetails, setExpandedDetails] = useState(false);
  const [temperatureScale, setTemperatureScale] = useState('C');

  const handleVoiceButton = () => {
    if (weather) {
      const temp = Math.round(weather.main.temp);
      const desc = weather.weather[0].description;
      speakText(`Toetr'andro ao ${city}. ${temp} degre. ${desc}.`, "fr-FR");
    }
  };

  const toggleTemperatureScale = () => {
    setTemperatureScale(scale => scale === 'C' ? 'F' : 'C');
  };

  const convertTemperature = (tempC) => {
    if (temperatureScale === 'F') {
      return Math.round((tempC * 9/5) + 32);
    }
    return Math.round(tempC);
  };

  // Weather-based color scheme
  const getWeatherColorScheme = () => {
    if (!weather) return 'from-blue-500 to-emerald-500';
    
    const weatherCondition = weather.weather[0].main.toLowerCase();
    
    switch(weatherCondition) {
      case 'clear':
        return 'from-amber-500 to-orange-500';
      case 'clouds':
        return 'from-sky-500 to-blue-500';
      case 'rain':
      case 'drizzle':
        return 'from-blue-600 to-indigo-600';
      case 'thunderstorm':
        return 'from-indigo-600 to-purple-600';
      case 'snow':
        return 'from-cyan-500 to-blue-400';
      default:
        return 'from-blue-500 to-emerald-500';
    }
  };

  return (
    <div className="flex flex-col h-full animate-fadeIn bg-gradient-to-b from-slate-50 via-white to-emerald-50">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={onFetchWeather}
              disabled={loading}
              className={`flex-shrink-0 w-14 h-14 flex items-center justify-center bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-300 ${
                !loading && 'hover:scale-105 active:scale-95'
              }`}
              title="Manavao ny toetr'andro"
            >
              <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
           

            <VoiceButton onClick={handleVoiceButton} disabled={!weather} />
          </div>

          <form onSubmit={onCityChange} className="flex gap-3">
            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <MapPin className="w-5 h-5 text-sky-500 group-hover:text-sky-600 transition-colors duration-300" />
              </div>
              <input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Soraty ny anaran'ny tanàna..."
                className="w-full border-2 border-sky-100 pl-12 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-3 focus:ring-sky-200 focus:border-sky-300 bg-white shadow-sm hover:border-sky-200 transition-all duration-300 placeholder:text-sky-300"
              />
            </div>
            <button
              type="submit"
              className="px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap group"
            >
              <span className="relative z-10">Jereo</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </form>
        </div>

        {error && (
          <div className="animate-shake p-4 bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-200 rounded-2xl text-rose-700 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></div>
              <span className="font-medium">⚠️ {error}</span>
            </div>
          </div>
        )}

        {/* Current Weather Display */}
        {weather && !loading && (
          <>
            {/* Main Weather Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-sky-50/50 to-white shadow-2xl border border-sky-100">
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-sky-400 to-cyan-400 rounded-full -translate-x-16 -translate-y-16 animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full translate-x-20 translate-y-20 animate-pulse-slow delay-1000"></div>
              </div>
              
              <div className="relative p-5 sm:p-8">
                {/* Location and Temperature */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-sky-500 to-blue-500 p-3 rounded-2xl shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{city}</h2>
                      <p className="text-sky-600 text-sm font-medium">Toetr'andro ankehitriny</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                      {convertTemperature(weather.main.temp)}°{temperatureScale}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Feeling: {convertTemperature(weather.main.feels_like)}°{temperatureScale}
                    </div>
                  </div>
                </div>

                {/* Weather Icon and Description */}
                <div className="flex items-center justify-center gap-8 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-200 to-cyan-200 rounded-3xl blur-xl opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-white to-sky-100 p-6 rounded-3xl shadow-lg border border-sky-200">
                      {getWeatherIcon(weather.weather[0].main, "w-20 h-20 sm:w-24 sm:h-24 text-sky-500")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-slate-800 capitalize mb-2 tracking-tight">
                      {weather.weather[0].description}
                    </div>
                    <div className="text-sky-500 font-medium">
                      {new Date().toLocaleDateString('fr-FR', { 
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long' 
                      })}
                    </div>
                  </div>
                </div>

                {/* Expand Details Button */}
                <button
                  onClick={() => setExpandedDetails(!expandedDetails)}
                  className="w-full bg-gradient-to-r from-sky-50 to-emerald-50 hover:from-sky-100 hover:to-emerald-100 border-2 border-sky-100 rounded-2xl p-4 flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg group"
                >
                  <span className="text-sky-700 font-semibold">
                    {expandedDetails ? 'Atsaharo ny fampahalalana' : 'Jereo ny antsipiriany'}
                  </span>
                  <div className={`transform transition-transform duration-300 ${expandedDetails ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-sky-500 group-hover:text-sky-600" />
                  </div>
                </button>
              </div>
            </div>

            {/* Expanded Details Section */}
            {expandedDetails && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-expand text-white">
                <WeatherCard
                  title="Hamandoana"
                  value={weather.main.humidity}
                  unit="%"
                  icon={<Droplets className="w-8 h-8 text-sky-500" />}
                  color="bg-gradient-to-br from-sky-500 to-blue-50 border-sky-200"
                  iconColor="from-sky-400 to-blue-500"
                  animate
                />
                <WeatherCard
                  title="Rivotra"
                  value={weather.wind.speed}
                  unit=" m/s"
                  icon={<WindIcon className="w-8 h-8 text-cyan-500" />}
                  color="bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200"
                  iconColor="from-cyan-400 to-teal-500"
                  animate
                />
                <WeatherCard
                  title="Tsindry"
                  value={weather.main.pressure}
                  unit=" hPa"
                  icon={<Gauge className="w-8 h-8 text-indigo-500" />}
                  color="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200"
                  iconColor="from-indigo-400 to-violet-500"
                  animate
                />
                <WeatherCard
                  title="Maripana"
                  value={`${convertTemperature(weather.main.temp_min)}/${convertTemperature(weather.main.temp_max)}`}
                  unit={`°${temperatureScale}`}
                  icon={<Thermometer className="w-8 h-8 text-orange-500" />}
                  color="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
                  iconColor="from-orange-400 to-amber-500"
                  animate
                />
              </div>
            )}

            {/* Forecast Section */}
            {forecast.length > 0 && (
              <div className="mt-6 animate-slideUp">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Faminaniana 5 andro</h3>
                    <p className="text-sky-600 text-sm font-medium">Ny toetr'andro ho avy</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-sky-100 rounded-full blur"></div>
                    <Wind className="w-8 h-8 text-sky-500 animate-pulse relative z-10" />
                  </div>
                </div>
                
                <div className="overflow-x-auto pb-4 -mx-2 px-2">
                  <div className="flex gap-4 min-w-max">
                    {forecast.map((day, idx) => (
                      <div 
                        key={idx} 
                        className="group relative bg-gradient-to-b from-white to-sky-50 p-4 rounded-2xl shadow-lg border border-sky-100 hover:shadow-2xl hover:border-sky-300 hover:scale-[1.03] transition-all duration-300 min-w-[150px] flex-shrink-0"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 text-center">
                          <div className="mb-3">
                            <div className="inline-block bg-gradient-to-br from-white to-sky-100 p-3 rounded-xl shadow-md">
                              {getWeatherIcon(day.weather[0].main, "w-12 h-12 text-sky-500")}
                            </div>
                          </div>
                          <div className="font-bold text-slate-800 mb-2">
                            {getDayNameMalagasy(day.dt_txt).substring(0, 3)}
                          </div>
                          <div className="text-xs text-sky-600 font-medium mb-3 bg-sky-50 px-3 py-1 rounded-full inline-block group-hover:bg-white transition-colors duration-300">
                            {new Date(day.dt_txt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </div>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                              {convertTemperature(day.main.temp)}°
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                              <Droplets className="w-4 h-4 text-sky-400" />
                              <span>{day.main.humidity}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Placeholder when no data */}
        {!weather && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full flex items-center justify-center animate-pulse-slow">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-200 to-cyan-200 rounded-full blur-xl opacity-30"></div>
                <Cloud className="w-16 h-16 text-sky-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Misafidiana tanàna</h3>
            <p className="text-slate-600 max-w-md text-lg mb-8">
              Soraty ny anaran'ny tanàna ianao hahazoana ny toetr'andro sy ny faminaniana 5 andro.
            </p>
            <div className="flex items-center gap-2 text-sky-500">
              <MapPin className="w-5 h-5 animate-bounce" />
              <span className="font-medium">Manomboka amin'ny fanoratana tanàna...</span>
            </div>
          </div>
        )}
      </div>

      {/* Background decorative elements */}
      <div className="hidden lg:block">
        <div className="absolute bottom-20 left-4 w-32 h-32 bg-gradient-to-br from-sky-200 to-cyan-200 rounded-full blur-3xl animate-pulse opacity-30"></div>
        <div className="absolute top-1/4 right-4 w-40 h-40 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full blur-3xl animate-pulse opacity-30 delay-1000"></div>
      </div>
    </div>
  );
}