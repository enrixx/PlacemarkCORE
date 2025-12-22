import axios from "axios";

export const weatherService = {
  async getWeather(latitude, longitude) {
    const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude,
        longitude,
        daily: "temperature_2m_max,temperature_2m_min",
        past_days: 7,
        forecast_days: 7,
        timezone: "auto"
      }
    });
    return response.data;
  }
};

