import axios from "axios";
import runPredictWildFire from "../testAI.js";
const API_KEY = "df23feb6c17d01620d3577d05641b174";
import { writeFile } from "fs/promises";
import generateWildfireImpact from "../genAI.js";
const getCurrentAQ = async (req, res) => {
  try {
    // Pull lat/lon from query string
    const latitude = req.query.lat;
    const longitude = req.query.lon;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "lat and lon are required" });
    }

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

const API_KEY_DATACLIMATE = "2ae8a8e91d77d8a2ff145347701a01cb";
const getCurrentDataClimate = async (req, res) => {
  try {
    const latitude = req.query.lat;
    const longitude = req.query.lon;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "lat and lon are required" });
    }

    const today = new Date().toISOString().split("T")[0];

    // const url = `https://api.openweathermap.org/data/3.0/onecall/day_summary?lat=${latitude}&lon=${longtitude}&date=${today}&appid=${API_KEY_}`;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY_DATACLIMATE}`;

    const response = await axios.get(url);

    const data = response.data;

    const resultJson = {
      // currentDate: data.date,
      // currentMinTemp: data.temperature.min,
      // currentMaxTemp: data.temperature.max,
      // curentWindSpeed: data.wind.max.speed,
      // currentPrecipitation: data.precipitation.total
      currentMinTemp: data.main.temp_min,
      currentMaxTemp: data.main.temp_max,
      currentWindSpeed: data.wind.speed,
      currentPrecipitation: data.main.humidity,
      // currentPrecipitation: data.rain?.["1h"]
    };

    return res.json({ result: resultJson });
  } catch (error) {
    console.error("Loi ROI!!", error.message);

    return res.status(502).json({
      error: "Failed to fetch data from OpenWeather day_summary endpoint",
      details: error.message,
    });
  }
};

const runPredict = async (req, res) => {
  try {
    const { fireLon, fireLat } = req.body;
    const prediction = await runPredictWildFire(fireLon, fireLat);
    return res.json({ data: prediction });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const runImpact = async (req, res) => {
  try {
    const { currentLon, currentLat, distanceToFire } = req.body;
    const impact = await generateWildfireImpact(
      currentLon,
      currentLat,
      distanceToFire
    );
    return res.json({ data: impact });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const saveCurrentCoordToJson = async (req, res) => {
  try {
    const { lon, lat } = req.body;
    const currentCoordObject = { currentLon: lon, currentLat: lat };
    const jsonString = JSON.stringify(currentCoordObject, null, 2);

    // write to a .json file (you can choose any path you like)
    await writeFile("./currentCoord.json", jsonString, "utf8");
    return res.json({ success: true });
  } catch (err) {
    console.error("Error writing file:", err);
    return res.status(500).json({ error: "Failed to write file" });
  }
};

export {
  saveCurrentCoordToJson,
  getCurrentAQ,
  getCurrentDataClimate,
  runPredict,
  runImpact,
};
