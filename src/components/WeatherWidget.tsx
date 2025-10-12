import { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind } from 'lucide-react';
import { weatherService, locationService, type WeatherData } from '@/services';

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      const coords = await locationService.getCoordinates();
      const weatherData = await weatherService.getCurrentWeather(coords.lat, coords.lng);

      setWeather(weatherData);
    } catch (err) {
      console.error('Weather widget error:', err);
      setError('Unable to load weather');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (error || !weather) {
    return null; // Silently fail if weather is not available
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{weather.city}</h3>
          <p className="text-sm opacity-90 capitalize">{weather.description}</p>
        </div>
        {weather.icon && (
          <img
            src={weatherService.getWeatherIconUrl(weather.icon)}
            alt={weather.description}
            className="w-16 h-16"
          />
        )}
      </div>

      <div className="flex items-baseline mb-4">
        <span className="text-5xl font-bold">{weather.temp}°</span>
        <span className="text-xl ml-2">C</span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center">
          <Cloud className="w-4 h-4 mr-1" />
          <span className="opacity-90">Feels {weather.feels_like}°</span>
        </div>
        <div className="flex items-center">
          <Droplets className="w-4 h-4 mr-1" />
          <span className="opacity-90">{weather.humidity}%</span>
        </div>
        <div className="flex items-center">
          <Wind className="w-4 h-4 mr-1" />
          <span className="opacity-90">
            {weather.temp_min}°/{weather.temp_max}°
          </span>
        </div>
      </div>
    </div>
  );
}
