// import axios from "axios";

// const API_KEY =
//   "42f3f49a5fe75a51266c4c046faa6fbbbbd135ff04c8fd019f44f76780a269f3";

// export const getCurrentLocationId = async (lat, lon) => {
//   const radius = 10000; // meters
//   const limit = 5; // up to 10 stations

//   try {
//     const url = `https://api.openaq.org/v3/locations?coordinates=${lat},${lon}&radius=${radius}&limit=${limit}`;
//     const response = await axios.get(url, {
//       headers: {
//         "X-API-Key": API_KEY,
//       },
//     });
//     // Instead of res.json(...), just return the raw data object:
//     return response.data; // this has shape: { meta: {...}, results: [ ... ] }
//   } catch (error) {
//     console.error("Error fetching AQ data in helper:", {
//       message: error.message,
//       status: error.response?.status,
//       data: error.response?.data,
//     });
//     // You could either throw or return null here; let the caller decide.
//     throw new Error(
//       error.response?.data?.error || "Failed to fetch data from OpenAQ"
//     );
//   }
// };

// export const getCurrentAQ = async (req, res) => {
//   try {
//     // Hard-code lat/lon for now, or read from req.query if you want dynamic values:
//     const latitude = 40.7705;
//     const longitude = -111.9076;

//     const dataObject = await getCurrentLocationId(latitude, longitude);
//     const pm25SensorsArray = dataObject.results.map((location) =>
//       location.sensors.filter((sensor) => sensor.name === "pm25 µg/m³")
//     );
//     var sensorIdArray = [];
//     pm25SensorsArray.forEach((sensor) => sensorIdArray.push(sensor[0].id));
//     var resultArray = [];
//     for (const sensors_id of sensorIdArray) {
//       const url = `https://api.openaq.org/v3/sensors/${sensors_id}/days`;
//       const response = await axios.get(url, {
//         headers: { "X-API-Key": API_KEY },
//       });
//       resultArray.push(response.data);
//     }
//     return res.json({ result: resultArray });
//   } catch (error) {
//     // If either helper or mapping fails, catch it here:
//     console.error("Error in getCurrentAQ handler:", error.message);
//     return res.status(502).json({
//       error: "Could not retrieve station IDs",
//       details: error.message,
//     });
//   }
// };
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
