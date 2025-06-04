import axios from "axios";

const API_KEY = "df23feb6c17d01620d3577d05641b174";

export const getCurrentAQ = async (req, res) => {
  try {
    // Hard-code
    const latitude = 40.7705;
    const longitude = -111.9076;

    // OpenWeather Air Pollution endpoint
    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
    const response = await axios.get(url);
    const resultObject = {
      currentAQI: response.data.list[0].main.aqi,
      currentPM25: response.data.list[0].components.pm2_5,
    };
    return res.json({ result: resultObject });
  } catch (error) {
    console.error(
      "Error fetching air quality data from OpenWeather:",
      error.message
    );
    return res.status(502).json({
      error: "Failed to fetch data from OpenWeather",
      details: error.message,
    });
  }
};
