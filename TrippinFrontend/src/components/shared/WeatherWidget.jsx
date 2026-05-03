import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind, Droplets, Eye, Thermometer, CloudFog } from 'lucide-react';
import { motion } from 'framer-motion';

const WEATHER_ICONS = {
  0: { icon: Sun, label: 'Clear sky', color: '#F59E0B' },
  1: { icon: Sun, label: 'Mainly clear', color: '#F59E0B' },
  2: { icon: Cloud, label: 'Partly cloudy', color: '#6B7280' },
  3: { icon: Cloud, label: 'Overcast', color: '#9CA3AF' },
  45: { icon: CloudFog, label: 'Foggy', color: '#9CA3AF' },
  48: { icon: CloudFog, label: 'Rime fog', color: '#9CA3AF' },
  51: { icon: CloudDrizzle, label: 'Light drizzle', color: '#60A5FA' },
  53: { icon: CloudDrizzle, label: 'Moderate drizzle', color: '#3B82F6' },
  55: { icon: CloudDrizzle, label: 'Dense drizzle', color: '#2563EB' },
  61: { icon: CloudRain, label: 'Slight rain', color: '#60A5FA' },
  63: { icon: CloudRain, label: 'Moderate rain', color: '#3B82F6' },
  65: { icon: CloudRain, label: 'Heavy rain', color: '#1D4ED8' },
  71: { icon: CloudSnow, label: 'Slight snow', color: '#93C5FD' },
  73: { icon: CloudSnow, label: 'Moderate snow', color: '#60A5FA' },
  75: { icon: CloudSnow, label: 'Heavy snow', color: '#3B82F6' },
  80: { icon: CloudRain, label: 'Rain showers', color: '#3B82F6' },
  81: { icon: CloudRain, label: 'Moderate showers', color: '#2563EB' },
  82: { icon: CloudRain, label: 'Violent showers', color: '#1D4ED8' },
  95: { icon: CloudLightning, label: 'Thunderstorm', color: '#7C3AED' },
  96: { icon: CloudLightning, label: 'Thunderstorm + hail', color: '#6D28D9' },
  99: { icon: CloudLightning, label: 'Severe thunderstorm', color: '#5B21B6' },
};

export default function WeatherWidget({ latitude, longitude, name }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`
        );
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setWeather(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  if (!latitude || !longitude) return null;
  if (error) return null;

  if (loading) {
    return (
      <div className="weather-widget">
        <div className="weather-widget-loading">
          <div className="loading-spinner sm" />
          <span>Fetching weather...</span>
        </div>
      </div>
    );
  }

  if (!weather?.current) return null;

  const current = weather.current;
  const code = current.weather_code;
  const weatherInfo = WEATHER_ICONS[code] || WEATHER_ICONS[0];
  const WeatherIcon = weatherInfo.icon;
  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);
  const humidity = current.relative_humidity_2m;
  const windSpeed = Math.round(current.wind_speed_10m);

  return (
    <motion.div
      className="weather-widget"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="weather-widget-header">
        <span className="weather-widget-title">Current Weather</span>
        <span className="weather-widget-location">{name}</span>
      </div>

      <div className="weather-widget-main">
        <motion.div
          className="weather-widget-icon"
          style={{ color: weatherInfo.color }}
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
        >
          <WeatherIcon size={48} />
        </motion.div>
        <div className="weather-widget-temp">
          <span className="weather-temp-value">{temp}°</span>
          <span className="weather-temp-unit">C</span>
        </div>
        <span className="weather-condition">{weatherInfo.label}</span>
      </div>

      <div className="weather-widget-details">
        <div className="weather-detail">
          <Thermometer size={14} />
          <span>Feels like {feelsLike}°C</span>
        </div>
        <div className="weather-detail">
          <Droplets size={14} />
          <span>{humidity}% humidity</span>
        </div>
        <div className="weather-detail">
          <Wind size={14} />
          <span>{windSpeed} km/h wind</span>
        </div>
      </div>
    </motion.div>
  );
}
