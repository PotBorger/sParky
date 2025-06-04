// src/components/WildFireMap.js
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
  // const [currentLat, setCurrentLat] = useState(0.0);
  // const [currentLon, setCurrentLon] = useState(0.0);
  const [selectedAQI, setSelectedAQI] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");

  const saveToJson = async (lon, lat) => {
    try {
      await axios.post("http://localhost:5001/api/save-coord", { lon, lat });
      console.log("Coord written to server");
    } catch (err) {
      console.error(err);
      console.log("Failed to save on server");
    }
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
      var aqObject = {};
      geocoderControl.on("result", async ({ result }) => {
        const coord = result.geometry.coordinates;
        aqObject = await getcurrentLocationAQ(coord[0], coord[1]);
        // const marker = new maplibregl.Marker({ color: "blue" })
        //   .setLngLat([coord[0], coord[1]])
        //   .addTo(map)
        //   .getElement()
        //   .addEventListener("click", () => {
        //     // new maplibregl.Popup({ offset: 25 })
        //     //   .setLngLat([coord[0], coord[1]])
        //     //   .setHTML(`<strong>${result.place_name}</strong>`)
        //     //   .addTo(map);
        //     console.log("cacscac");
        //   })

        const markerElement = new maplibregl.Marker({ color: "blue" })
          .setLngLat([coord[0], coord[1]])
          .addTo(map)
          .getElement(); // Get the DOM element

        markerElement.addEventListener("click", () => {
          console.log("cacscac");
        });

        // Set cursor style to pointer
        markerElement.style.cursor = "pointer";

        map.flyTo({
          center: result.geometry.coordinates,
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
              aqi: 132,
              message:
                "Washington County - AQI: 132 (Unhealthy for Sensitive Groups)",
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
              aqi: 88,
              message: "Iron County - AQI: 88 (Moderate)",
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
              aqi: 148,
              message:
                "Box Elder County - AQI: 148 (Unhealthy for Sensitive Groups)",
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
              aqi: 74,
              message: "Tooele County - AQI: 74 (Moderate)",
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
              aqi: 95,
              message: "Utah County - AQI: 95 (Moderate)",
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
              aqi: 53,
              message: "Salt Lake County - AQI: 53 (Moderate)",
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
              aqi: 61,
              message: "Juab County - AQI: 61 (Moderate)",
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
              aqi: 49,
              message: "Sanpete County - AQI: 49 (Good)",
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
              aqi: 58,
              message: "Garfield County - AQI: 58 (Moderate)",
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
              aqi: 112,
              message:
                "Grand County - AQI: 112 (Unhealthy for Sensitive Groups)",
            },
          },
        ],
      };

      // Log any geocoder errors
      geocoderControl.on("error", (err) =>
        console.error("Geocoder error:", err)
      );

      geojson.features.forEach((marker) => {
        // create a DOM element for the marker
        const el = document.createElement("div");
        el.className = "marker";
        el.style.backgroundImage = `url(https://scontent-den2-1.xx.fbcdn.net/v/t1.15752-9/491182927_1031472402451810_2677738583898578422_n.png?stp=dst-png_s480x480&_nc_cat=106&ccb=1-7&_nc_sid=0024fc&_nc_ohc=o80woKmGPl8Q7kNvwHV-Eiy&_nc_oc=AdkRk7LFzrjCP3MB0FUay-l5H66WvMtqNe4TVG7SVJIjtODjqrfqsMUYaKPjtzO8-Hs&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-den2-1.xx&oh=03_Q7cD2QFxHr_laz7jTuaTNHrn-aCB1PjJ0Nk4ycS1NgiY0OWOgg&oe=685618F1)`;
        el.style.backgroundSize = "contain";
        el.style.backgroundRepeat = "no-repeat";
        el.style.width = `30px`;
        el.style.height = `30px`;
        el.style.cursor = "pointer";

        el.addEventListener("click", () => {
          // Set the AQI value without moving the map
          setSelectedAQI(marker.properties.aqi);
          setSelectedLocation(marker.properties.label);
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
      <div className="map-wrapper">
        <div ref={mapContainer} className="map-container" />
        <AQIBar aqi={selectedAQI} location={selectedLocation} />
      </div>
    </div>
  );
}
