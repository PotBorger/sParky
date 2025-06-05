import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";
import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";

import { withAPIKey } from "@aws/amazon-location-utilities-auth-helper";
import { GeoPlacesClient } from "@aws-sdk/client-geo-places";

import GeoPlaces from "../util.js";
import "./FireForesight.css";

import { useLocation } from "react-router-dom";
import AQIBar from "./AQIBar.js";

export default function WildFireMap() {
  const mapContainer = useRef(null);
  const { search } = useLocation();
  const initialLocation = new URLSearchParams(search).get("initialLocation");
  const [currentLonLat, setCurrentLonLat] = useState([0.0, 0.0]);
  const [selectedAQI, setSelectedAQI] = useState(null);
  const [userAQ, setUserAQ] = useState({});
  const [selectedLocation, setSelectedLocation] = useState("");
  const [wildfireProbability, setWildfireProbability] = useState(0);
  const [impactedAQI, setImpactedAQI] = useState(null);
  const [safetyAdvice, setSafetyAdvice] = useState([]);

  async function saveToJson(lon, lat) {
    try {
      await axios.post("http://localhost:5001/api/save-coord", { lon, lat });
      console.log("Coord written to server");
    } catch (err) {
      console.error(err);
      console.log("Failed to save on server");
    }
  }

  async function generateImpactAtLocation(
    currentLon,
    currentLat,
    distanceToFire
  ) {
    try {
      console.log("cac to" + currentLonLat);
      const response = await axios.post(
        "http://localhost:5001/api/run-impact",
        { currentLon, currentLat, distanceToFire }
      );
      console.log(response.data.data);
    } catch (err) {
      console.error(err);
      console.log("Failed Loi cac impact");
    }
  }
  async function predictFireAtLocation(fireLon, fireLat) {
    try {
      console.log("cac" + [fireLon, fireLat]);

      const response = await axios.post(
        "http://localhost:5001/api/run-predict",
        { fireLon, fireLat }
      );
      console.log(response.data.data);
    } catch (err) {
      console.error(err);
      console.log("Failed Loi cac");
    }
  }
  // Helper function to format AQ data for display
  const formatAQData = (aqData) => {
    if (!aqData) return "No air quality data available";

    let html = "<div style='max-width: 300px; padding: 10px;'>";
    html +=
      "<h3 style='margin: 0 0 10px 0; color: #333;'>Air Quality Data</h3>";
    var formattedKey = "";
    // Display each property of the AQ object
    Object.entries(aqData).forEach(([key, value]) => {
      key === "currentAQI"
        ? (formattedKey = "Current Air Quality Index")
        : (formattedKey = "Current PM2.5");

      html += `<div style='margin-bottom: 5px;'><strong>${formattedKey}:</strong> ${value}</div>`;
    });

    html += "</div>";
    return html;
  };

  // Function to calculate wildfire probability and impact based on AQI
  const calculateWildfireData = (aqi) => {
    // Simple algorithm - higher AQI indicates higher fire risk
    let probability = Math.min(Math.max((aqi - 30) * 1.5, 0), 95);
    let impact = aqi + Math.floor(probability * 0.8); // Fire could worsen AQI

    let advice = [];

    if (probability > 70) {
      advice = [
        "Stay indoors and keep windows and doors closed",
        "Use air purifiers or create a clean air room",
        "Avoid all outdoor activities, especially exercise",
        "Wear N95 masks when you must go outside",
        "Monitor local emergency alerts and evacuation notices",
        "Keep emergency supplies ready including medications",
      ];
    } else if (probability > 40) {
      advice = [
        "Limit outdoor activities, especially strenuous exercise",
        "Keep windows closed and use air conditioning on recirculate",
        "Consider wearing masks when outdoors",
        "Stay informed about local fire conditions",
        "Prepare emergency supplies just in case",
      ];
    } else if (probability > 15) {
      advice = [
        "Monitor air quality conditions regularly",
        "Be prepared to limit outdoor activities if conditions worsen",
        "Keep informed about local fire weather conditions",
      ];
    } else {
      advice = [
        "Current fire risk is low",
        "Continue normal outdoor activities",
        "Stay informed about changing conditions",
      ];
    }

    return {
      probability: Math.round(probability),
      impactedAQI: Math.round(impact),
      advice,
    };
  };

  useEffect(() => {
    let map, geocoderControl;
    (async () => {
      const API_KEY =
        "v1.public.eyJqdGkiOiIyOGFlZjc2MS1hZGE3LTRkMTQtYjVhZi0zNjNhMmZkNTUwYTcifUH5Z7GPNiZfzEWRrhUXdzGS2-fqSg7W11ab6pgIo_5Xc8o_Zw6jTA_YDKgTYsynAQCj7IYtjznbn-sIO3W9QH_akkf259vubkY1aiBUAkBDubulx6cpc5oZ9TOTc8ml7qmjIFe_yGHlHld7KhyTztM6QGdNMbhYLKWR4VrTrP0NGeQ9AhBS1TyOzXWV3L613hh4Yv8lp0GnjpTRNystEAHZo8L9EIUt9f4uxZlyWObVuJFurC00WoazrO3P9o_ncw3lI5Xf8T6i2qxDRF32ZyX9CfzKaHWfNW4bq-D38SQ739pKv_00FXmwC6o_lEJtxewa0Nf6nPmWfzTMisrOvAw.ZWU0ZWIzMTktMWRhNi00Mzg0LTllMzYtNzlmMDU3MjRmYTkx";
      const AWS_REGION = "us-east-1";

      // 1) Initialize MapLibre
      map = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/Standard/descriptor?key=${API_KEY}&color-scheme=Dark`,
        center: [-111.876183, 40.758701],
        zoom: 10,
        validateStyle: false,
      });

      map.addControl(new maplibregl.NavigationControl(), "top-left");

      // 2) Create AWS Places client + adapter
      const authHelper = withAPIKey(API_KEY, AWS_REGION);
      const placesClient = new GeoPlacesClient(authHelper.getClientConfig());
      const geoPlaces = new GeoPlaces(placesClient, map);

      // Add the geocoder (search) control - but disable auto-fly
      geocoderControl = new MaplibreGeocoder(geoPlaces, {
        maplibregl,
        marker: false,
        showResultsWhileTyping: true,
        debounceSearch: 300,
        limit: 5,
        placeholder: "Search address or place…",
        popuprender: (feature) => `
          <div class="popup-content">
            <strong>${feature.place_name}</strong><br/>
            <span class="${feature.place_type.toLowerCase()} badge">${
          feature.place_type
        }</span>
          </div>`,
        zoom: 14,
        flyTo: true,
      });

      map.addControl(geocoderControl, "bottom-right");

      // 4) Handle initial location without any movement
      if (initialLocation) {
        geocoderControl.query(initialLocation);
      }

      async function getcurrentLocationAQ(longitude, latitude) {
        try {
          // include lat & lon as query params
          const response = await axios.get(
            `http://localhost:5001/api/currentAQ?lat=${latitude}&lon=${longitude}`
          );
          return response.data.result;
        } catch (error) {
          console.error("API error:", error.response?.status, error.message);
        }
      }

      let currentMarker = null; // Keep track of the current blue marker

      geocoderControl.on("result", async ({ result }) => {
        const coord = result.geometry.coordinates;
        setCurrentLonLat([coord[0], coord[1]]);
        setUserAQ(await getcurrentLocationAQ(coord[0], coord[1]));
        saveToJson(coord[0], coord[1]);
        // 1) Remove any existing marker
        if (currentMarker) {
          currentMarker.remove();
        }

        // 2) Create exactly one blue marker and save it to currentMarker
        currentMarker = new maplibregl.Marker({ color: "blue" })
          .setLngLat([coord[0], coord[1]])
          .addTo(map);

        // 3) Grab its DOM element (no more `markerElement`)
        const el = currentMarker.getElement();
        el.style.cursor = "pointer";

        // 4) Attach a click listener to open a Popup
        el.addEventListener("click", () => {
          new maplibregl.Popup({
            offset: 25,
            maxWidth: "400px",
            closeButton: true,
            closeOnClick: false,
          })
            .setLngLat([coord[0], coord[1]])
            .setHTML(
              `
        <div style="max-width: 350px; padding: 15px;">
          <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
            Current Air Quality Data
          </h3>
          <div style="color: #555; font-size: 14px;">
            <strong>Current Location:</strong> ${result.place_name}<br/>
            <div style="margin-top: 10px;">
              ${formatAQData(userAQ)}
            </div>
          </div>
        </div>
      `
            )
            .addTo(map);
        });

        // Fly the map to the new location
        map.flyTo({
          center: [coord[0], coord[1]],
          zoom: 14,
          speed: 1.2,
          marker: false,
        });
      });

      // Updated geojson with realistic AQI values
      const geojson = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-113.5049, 37.2804],
            },
            properties: {
              label: "Washington County",
              color: "#FF5722",
              // original US‐EPA AQI 132 → falls in 101–150, so OpenWeather index = 3 (Moderate)
              aqi: 3,
              message: "Washington County – AQI: 3 (Moderate)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-113.2893, 37.8592],
            },
            properties: {
              label: "Iron County",
              color: "#FF9800",
              // original 88 → 51–100 → index 2 (Fair)
              aqi: 2,
              message: "Iron County – AQI: 2 (Fair)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-113.0821, 41.521],
            },
            properties: {
              label: "Box Elder County",
              color: "#E91E63",
              // original 148 → 101–150 → index 3 (Moderate)
              aqi: 3,
              message: "Box Elder County – AQI: 3 (Moderate)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-113.1311, 40.4488],
            },
            properties: {
              label: "Tooele County",
              color: "#FFC107",
              // original 74 → 51–100 → index 2 (Fair)
              aqi: 2,
              message: "Tooele County – AQI: 2 (Fair)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-111.6703, 40.1199],
            },
            properties: {
              label: "Utah County",
              color: "#9C27B0",
              // original 95 → 51–100 → index 2 (Fair)
              aqi: 2,
              message: "Utah County – AQI: 2 (Fair)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-111.9236, 40.6674],
            },
            properties: {
              label: "Salt Lake County",
              color: "#4CAF50",
              // original 53 → 51–100 → index 2 (Fair)
              aqi: 2,
              message: "Salt Lake County – AQI: 2 (Fair)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-112.785, 39.7027],
            },
            properties: {
              label: "Juab County",
              color: "#03A9F4",
              // original 61 → 51–100 → index 2 (Fair)
              aqi: 2,
              message: "Juab County – AQI: 2 (Fair)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-111.5763, 39.374],
            },
            properties: {
              label: "Sanpete County",
              color: "#8BC34A",
              // original 49 → 0–50 → index 1 (Good)
              aqi: 1,
              message: "Sanpete County – AQI: 1 (Good)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-111.433, 37.833],
            },
            properties: {
              label: "Garfield County",
              color: "#795548",
              // original 58 → 51–100 → index 2 (Fair)
              aqi: 2,
              message: "Garfield County – AQI: 2 (Fair)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-109.615, 38.9915],
            },
            properties: {
              label: "Grand County",
              color: "#FF5722",
              aqi: 3,
              message: "Grand County – AQI: 3 (Moderate)",
            },
          },
        ],
      };

      // Log any geocoder errors
      geocoderControl.on("error", (err) =>
        console.error("Geocoder error:", err)
      );

      // Create FLAME MARKER
      geojson.features.forEach((marker) => {
        // Create a DOM element for the marker
        const el = document.createElement("div");
        el.className = "marker";
        el.style.backgroundImage = `url(https://scontent-den2-1.xx.fbcdn.net/v/t1.15752-9/491182927_1031472402451810_2677738583898578422_n.png?stp=dst-png_s480x480&_nc_cat=106&ccb=1-7&_nc_sid=0024fc&_nc_ohc=o80woKmGPl8Q7kNvwHV-Eiy&_nc_oc=AdkRk7LFzrjCP3MB0FUay-l5H66WvMtqNe4TVG7SVJIjtODjqrfqsMUYaKPjtzO8-Hs&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-den2-1.xx&oh=03_Q7cD2QFxHr_laz7jTuaTNHrn-aCB1PjJ0Nk4ycS1NgiY0OWOgg&oe=685618F1)`;
        el.style.backgroundSize = "contain";
        el.style.backgroundRepeat = "no-repeat";
        el.style.width = `30px`;
        el.style.height = `30px`;
        el.style.cursor = "pointer";

        el.addEventListener("click", () => {
          const coord = marker.geometry.coordinates; // [lon, lat]
          predictFireAtLocation(coord[0], coord[1]);
          generateImpactAtLocation(currentLonLat[0], currentLonLat[1], 100); // DEFAULT đang 100KM, bỏ distance real dô
          // Calculate wildfire data based on the selected AQI
          const wildfireData = calculateWildfireData(marker.properties.aqi);
          // Set all the AQI and wildfire-related state
          setSelectedAQI(marker.properties.aqi);
          setSelectedLocation(marker.properties.label);
          setWildfireProbability(wildfireData.probability);
          setImpactedAQI(wildfireData.impactedAQI);
          setSafetyAdvice(wildfireData.advice);
        });

        new maplibregl.Marker({
          element: el,
          draggable: false,
        })
          .setLngLat(marker.geometry.coordinates)
          .addTo(map);
      });
    })();

    return () => map?.remove();
  }, [initialLocation, setSelectedAQI, setSelectedLocation]);

  return (
    <div className="map-page-container">
      <div className="map-bar-wrapper">
        <div ref={mapContainer} className="map-container" />
        <AQIBar
          probability={wildfireProbability}
          currentAQI={selectedAQI}
          impactedAQI={impactedAQI}
          location={selectedLocation}
          advice={safetyAdvice}
        />
      </div>
    </div>
  );
}
