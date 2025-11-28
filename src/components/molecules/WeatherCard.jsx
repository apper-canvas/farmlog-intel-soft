import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import weatherService from "@/services/api/weatherService";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";

const WeatherCard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await weatherService.getCurrentWeather();
      setWeatherData(data);
    } catch (err) {
      setError("Failed to load weather data");
      console.error("Weather loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card h-64 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-gray-500">Loading weather...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card h-64">
        <ErrorView
          className="h-full"
          title="Weather Unavailable"
          message={error}
          onRetry={loadWeatherData}
        />
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <div className="card">
      <div className="space-y-4">
        {/* Current Weather */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-gray-900">Weather</h3>
            <p className="text-sm text-gray-600">{weatherData.location}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <ApperIcon name={weatherData.current.icon} className="w-8 h-8 text-accent" />
              <span className="text-2xl font-bold text-gray-900">{weatherData.current.temp}°</span>
            </div>
            <p className="text-sm text-gray-600">{weatherData.current.condition}</p>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <ApperIcon name="Droplets" className="w-4 h-4 text-info" />
            <span className="text-sm text-gray-600">{weatherData.current.humidity}% humidity</span>
          </div>
          <div className="flex items-center gap-2">
            <ApperIcon name="Wind" className="w-4 h-4 text-info" />
            <span className="text-sm text-gray-600">{weatherData.current.windSpeed} mph</span>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">5-Day Forecast</h4>
          <div className="grid grid-cols-5 gap-2">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="text-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <p className="text-xs font-medium text-gray-600 mb-1">{day.day}</p>
                <ApperIcon name={day.icon} className="w-5 h-5 text-accent mx-auto mb-1" />
                <p className="text-sm font-semibold text-gray-900">{day.temp}°</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;