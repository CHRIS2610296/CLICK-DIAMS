import React from 'react';
import { Cloud, CloudRain, Sun } from 'lucide-react';

export function getWeatherIcon(main, size = "w-8 h-8") {
  const baseClass = `${size}`;
  
  switch (main) {
    case "Rain":
    case "Drizzle":
      return <CloudRain className={`${baseClass} text-blue-500`} />;
    case "Clouds":
      return <Cloud className={`${baseClass} text-gray-500`} />;
    case "Clear":
      return <Sun className={`${baseClass} text-yellow-500`} />;
    case "Snow":
      return <Cloud className={`${baseClass} text-blue-300`} />;
    case "Thunderstorm":
      return <CloudRain className={`${baseClass} text-purple-600`} />;
    case "Mist":
    case "Fog":
    case "Haze":
      return <Cloud className={`${baseClass} text-gray-400`} />;
    default:
      return <Cloud className={`${baseClass} text-gray-400`} />;
  }
}
