import React, { useState, useEffect } from 'react';
import { 
  X, AlertTriangle, CloudRain, Wind, Droplets, Calendar, 
  Thermometer, Cloud, CloudLightning, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle, Shield, Bell, MapPin, Sun
} from 'lucide-react';
import { farmingCalendar, monthsMG } from '../utils/constants';

export default function AlertModal({ weather, onClose }) {
  const [activeTab, setActiveTab] = useState('alerts');
  const [currentMonth] = useState(new Date().getMonth());

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!weather) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-gray-900/80 to-black/80 backdrop-blur-xl"
          onClick={onClose}
        />
        
        <div 
          className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-white/20 overflow-hidden w-full max-w-md animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 text-center">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mb-6">
              <Cloud className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Tsy misy fampahalalana</h3>
            <p className="text-gray-600 mb-8">Tsy misy toetr'andro hita ho an'ny toerana voafantina</p>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
            >
              Hidy
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Weather data
  const condition = weather.weather?.[0]?.main;
  const windSpeed = weather.wind?.speed || 0;
  const humidity = weather.main?.humidity || 0;
  const temperature = Math.round(weather.main?.temp || 0);
  const currentMonthData = farmingCalendar[currentMonth];

  // Weather alerts with enhanced categorization
  const weatherAlerts = [];
  const getAlertSeverity = (alertType) => {
    switch(alertType) {
      case 'critical': return { label: 'Kritika', color: 'from-red-500 to-rose-500', icon: '⚡', bg: 'bg-red-50', border: 'border-red-200' };
      case 'warning': return { label: 'Fampitandremana', color: 'from-orange-500 to-amber-500', icon: '⚠️', bg: 'bg-orange-50', border: 'border-orange-200' };
      case 'info': return { label: 'Fanamarihana', color: 'from-blue-500 to-cyan-500', icon: 'ℹ️', bg: 'bg-blue-50', border: 'border-blue-200' };
      default: return { label: 'Fanamarihana', color: 'from-gray-500 to-slate-500', icon: '📝', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  // Drizzle Alert
  if (condition === 'Drizzle') {
    weatherAlerts.push({
      id: 'drizzle',
      severity: 'info',
      icon: '🌦️',
      title: 'Orana Madinika',
      message: 'Misy orana madinika ankehitriny. Tsara ny hanasitrana ny ahidratsy sy zavamaniry.',
      gradient: 'from-sky-400 to-cyan-400'
    });
  }

  // Rain Alert
  if (condition === 'Rain') {
    weatherAlerts.push({
      id: 'rain',
      severity: 'warning',
      icon: '🌧️',
      title: 'Orana Mahery',
      message: 'Misy orana mahery! Tsy tokony hiasa any an-tsaha fa mety ho voan\'ny kotroka.',
      gradient: 'from-blue-500 to-indigo-500'
    });
  }

  // Thunderstorm Alert
  if (condition === 'Thunderstorm') {
    weatherAlerts.push({
      id: 'storm',
      severity: 'critical',
      icon: '⛈️',
      title: 'FAMPITANDREMANA: KOTROKA',
      message: 'Misy kotroka mahery! Mijanòna ao an-trano ary aza mivoaka. Aoka ny tariby elektrika.',
      gradient: 'from-purple-600 to-rose-600'
    });
  }

  // Wind Alert
  if (windSpeed > 10) {
    weatherAlerts.push({
      id: 'wind',
      severity: windSpeed > 15 ? 'critical' : 'warning',
      icon: '💨',
      title: windSpeed > 15 ? 'RIVOTRA MAHERY' : 'Rivotra Antonio',
      message: windSpeed > 15 
        ? `Rivotra mahery: ${windSpeed.toFixed(1)} m/s. Aza mivoaka ivelany raha tsy ilaina.`
        : `Rivotra antonio: ${windSpeed.toFixed(1)} m/s. Aza mijanona eo ambanin'ny hazo.`,
      gradient: windSpeed > 15 ? 'from-red-500 to-orange-500' : 'from-amber-500 to-yellow-500'
    });
  }

  // Humidity Alert
  if (humidity > 85) {
    weatherAlerts.push({
      id: 'humidity',
      severity: 'info',
      icon: '💧',
      title: 'Hamandoana Avobe',
      message: `Hamandoana avo: ${humidity}%. Mety hisy haranita sy holatra.`,
      gradient: 'from-cyan-500 to-blue-500'
    });
  }

  // Temperature Alerts
  if (temperature > 35) {
    weatherAlerts.push({
      id: 'high-temp',
      severity: 'warning',
      icon: '🔥',
      title: 'Maripana Avobe',
      message: 'Maripana avobe: 35°C mihoatra. Aza mitsangatsangana masoandro ary misotro rano be.',
      gradient: 'from-red-600 to-orange-600'
    });
  }

  if (temperature < 10) {
    weatherAlerts.push({
      id: 'low-temp',
      severity: 'warning',
      icon: '❄️',
      title: 'Maripana Ambany',
      message: 'Maripana ambany: 10°C mihena. Manaova akanjo mafana ary miaro ny zavamaniry.',
      gradient: 'from-blue-400 to-cyan-400'
    });
  }

  // Determine overall severity
  const hasCriticalAlert = weatherAlerts.some(a => a.severity === 'critical');
  const hasWarningAlert = weatherAlerts.some(a => a.severity === 'warning');
  const overallSeverity = hasCriticalAlert ? 'critical' : hasWarningAlert ? 'warning' : 'info';

  const severityConfig = {
    critical: { gradient: 'from-red-600 to-rose-600', icon: <AlertTriangle className="w-6 h-6" /> },
    warning: { gradient: 'from-orange-500 to-amber-500', icon: <AlertCircle className="w-6 h-6" /> },
    info: { gradient: 'from-blue-500 to-cyan-500', icon: <Shield className="w-6 h-6" /> }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-gray-900/90 to-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      
      {/* Main Modal */}
      <div 
        className="relative w-full max-w-4xl bg-gradient-to-br from-white to-gray-50/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Dynamic Gradient */}
        <div className={`bg-gradient-to-r ${severityConfig[overallSeverity].gradient} p-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30 shadow-lg">
                {severityConfig[overallSeverity].icon}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">Fampitandremana</h2>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-xl border border-white/30 text-white hover:scale-110 transition-all duration-300 group"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'alerts'
                  ? 'bg-white text-gray-800 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Fampitandremana
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'calendar'
                  ? 'bg-white text-gray-800 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Boky Fambolena
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'details'
                  ? 'bg-white text-gray-800 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Antsipiriany
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 max-h-[65vh] overflow-y-auto">
          {/* Weather Status Card */}
          <div className={`bg-gradient-to-r ${severityConfig[overallSeverity].gradient}/10 backdrop-blur-sm rounded-2xl p-6 border ${getAlertSeverity(overallSeverity).border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">
                  {weatherAlerts.length > 0 
                    ? weatherAlerts[0].icon 
                    : overallSeverity === 'critical' ? '⚡' : 
                      overallSeverity === 'warning' ? '⚠️' : '✅'
                  }
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {overallSeverity === 'critical' ? 'TOETR\'ANDRO MAFAY' :
                     overallSeverity === 'warning' ? 'TOETR\'ANDRO TSY ARA-BATANA' :
                     'TOETR\'ANDRO TSARA'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {overallSeverity === 'critical' ? 'Aza mivoaka ivelany! Mijanona ao an-trano.' :
                     overallSeverity === 'warning' ? 'Mitantana ny asanao amin\'ny fomba feno fitandremana' :
                     'Azonao atao ny hiasa tsy misy olana'}
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <span className="text-white font-semibold">
                  {getAlertSeverity(overallSeverity).label}
                </span>
              </div>
            </div>
          </div>

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6 animate-fadeIn">
              {weatherAlerts.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-800">Fampitandremana</h3>
                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                      {weatherAlerts.length} fampitandremana
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {weatherAlerts.map(alert => {
                      const severity = getAlertSeverity(alert.severity);
                      return (
                        <div 
                          key={alert.id}
                          className={`bg-gradient-to-r ${alert.gradient} backdrop-blur-sm rounded-2xl p-6 text-white shadow-lg border ${severity.border}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-4xl flex-shrink-0">{alert.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h4 className="text-xl font-bold">{alert.title}</h4>
                                <span className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-sm font-semibold">
                                  {severity.label}
                                </span>
                              </div>
                              <p className="text-white/95 leading-relaxed">{alert.message}</p>
                              {alert.severity === 'critical' && (
                                <div className="flex items-center gap-2 mt-4">
                                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                                  <span className="text-sm font-semibold">ZAVA-DEHIBE: Aza manadino ny fiarovana tena</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-800 mb-3">Tsy misy fampitandremana</h3>
                  <p className="text-emerald-600 max-w-md mx-auto">
                    Toetr'andro tsara sy azo antoka ny hiasa. Manohy ny asanao ara-dalàna.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">Boky Fambolena</h3>
                <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-sm font-semibold">
                  {monthsMG[currentMonth]}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-200 rounded-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-5xl">{currentMonthData.icon}</div>
                    <div>
                      <h4 className="text-xl font-bold text-emerald-800">Volana {monthsMG[currentMonth]}</h4>
                      <p className="text-emerald-600">{currentMonthData.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentMonthData.activities.map((activity, index) => (
                      <div 
                        key={index}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-gradient-to-br from-emerald-500 to-green-500 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{activity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">Antsipirian'ny Toetr'andro</h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>Tanàna voafantina</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-blue-100">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-3">
                      <Thermometer className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-blue-800">{temperature}°C</div>
                    <div className="text-blue-600 text-sm">Maripana</div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-blue-100">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full mb-3">
                      <Droplets className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-cyan-800">{humidity}%</div>
                    <div className="text-cyan-600 text-sm">Hamandoana</div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-blue-100">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-500 rounded-full mb-3">
                      <Wind className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{windSpeed.toFixed(1)} m/s</div>
                    <div className="text-gray-600 text-sm">Rivotra</div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-blue-100">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-slate-500 to-gray-500 rounded-full mb-3">
                      <Cloud className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{weather.clouds?.all || 0}%</div>
                    <div className="text-slate-600 text-sm">Rahona</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Fampahalalana fanampiny</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Toe-javatra</span>
                    <span className="font-semibold">{weather.weather?.[0]?.description || 'Tsy fantatra'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Tsindry</span>
                    <span className="font-semibold">{weather.main?.pressure || 0} hPa</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600">Fahitana</span>
                    <span className="font-semibold">{weather.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : 'Tsy fantatra'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
            >
              OKKK!👌
            </button>
            <button className="flex-1 py-4 bg-gradient-to-r from-slate-100 to-gray-100 text-gray-700 font-bold rounded-2xl hover:from-slate-200 hover:to-gray-200 transition-all duration-300 border border-gray-300 active:scale-95">
              Ampio amin'ny fampahatsiahivana
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}