import React from 'react';

export default function WeatherCard({ title, value, unit, icon, color }) {
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-400 to-blue-500",
    green: "bg-gradient-to-br from-green-400 to-emerald-500",
    orange: "bg-gradient-to-br from-orange-400 to-amber-500",
    purple: "bg-gradient-to-br from-purple-400 to-violet-500"
  };

  return (
    <div className={`${colorClasses[color]} text-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs sm:text-sm opacity-90">{title}</div>
          <div className="text-xl sm:text-2xl font-bold mt-1">{value}{unit}</div>
        </div>
        <div className="text-2xl sm:text-3xl">
          {icon}
        </div>
      </div>
    </div>
  );
}
