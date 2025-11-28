class WeatherService {
  constructor() {
    this.mockWeatherData = {
      location: "Fresno, CA",
      current: {
        temp: 72,
        condition: "Sunny",
        icon: "Sun",
        humidity: 45,
        windSpeed: 8
      },
      forecast: [
        { day: "Today", temp: 72, condition: "Sunny", icon: "Sun" },
        { day: "Tomorrow", temp: 75, condition: "Partly Cloudy", icon: "PartlyCloudyDay" },
        { day: "Wed", temp: 68, condition: "Cloudy", icon: "Cloud" },
        { day: "Thu", temp: 71, condition: "Light Rain", icon: "CloudRain" },
        { day: "Fri", temp: 74, condition: "Sunny", icon: "Sun" }
      ]
    };
  }

  async delay() {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 300));
  }

  async getCurrentWeather() {
    await this.delay();
    return this.mockWeatherData;
  }

  async getForecast() {
    await this.delay();
    return this.mockWeatherData.forecast;
  }
}

export default new WeatherService();