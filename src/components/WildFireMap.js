// src/components/WildFireMap.js
import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

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

  const [selectedAQI, setSelectedAQI] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");

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

      // 3) Add the geocoder (search) control - but disable auto-fly
      geocoderControl = new MaplibreGeocoder(geoPlaces, {
        maplibregl,
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
        // Just query but don't move the map
        geocoderControl.query(initialLocation);
      }

      geocoderControl.on("result", ({ result }) => {
        map.flyTo({
          center: result.geometry.coordinates,
          zoom: 14,
          speed: 1.2,
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
              coordinates: [-111.876183, 40.758701],
            },
            properties: {
              label: "Salt Lake City",
              color: "#FF5722",
              aqi: 89,
              message: "Salt Lake City - AQI: 89 (Moderate)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [85.1376, 25.5941],
            },
            properties: {
              label: "Patna",
              color: "#FF5722",
              aqi: 156,
              message: "Patna - AQI: 156 (Unhealthy)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [77.1025, 28.7041],
            },
            properties: {
              label: "Delhi",
              color: "#2196F3",
              aqi: 234,
              message: "Delhi - AQI: 234 (Very Unhealthy)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [77.5946, 12.9716],
            },
            properties: {
              label: "Bangalore",
              color: "#FF9800",
              aqi: 67,
              message: "Bangalore - AQI: 67 (Moderate)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [78.4867, 17.385],
            },
            properties: {
              label: "Hyderabad",
              color: "#9C27B0",
              aqi: 98,
              message: "Hyderabad - AQI: 98 (Moderate)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-87.6298, 41.8781],
            },
            properties: {
              label: "Chicago",
              color: "#4CAF50",
              aqi: 43,
              message: "Chicago - AQI: 43 (Good)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-122.3321, 47.6062],
            },
            properties: {
              label: "Seattle",
              color: "#FFC107",
              aqi: 72,
              message: "Seattle - AQI: 72 (Moderate)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [4.3517, 50.8503],
            },
            properties: {
              label: "Brussels",
              color: "#3F51B5",
              aqi: 38,
              message: "Brussels - AQI: 38 (Good)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [2.3522, 48.8566],
            },
            properties: {
              label: "Paris",
              color: "#E91E63",
              aqi: 54,
              message: "Paris - AQI: 54 (Moderate)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-0.1276, 51.5074],
            },
            properties: {
              label: "London",
              color: "#795548",
              aqi: 61,
              message: "London - AQI: 61 (Moderate)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [28.0473, -26.2041],
            },
            properties: {
              label: "Johannesburg",
              color: "#673AB7",
              aqi: 87,
              message: "Johannesburg - AQI: 87 (Moderate)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-123.1216, 49.2827],
            },
            properties: {
              label: "Vancouver",
              color: "#FF5722",
              aqi: 134,
              message: "Vancouver - AQI: 134 (Unhealthy for Sensitive Groups)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-104.9903, 39.7392],
            },
            properties: {
              label: "Denver",
              color: "#FF9800",
              aqi: 78,
              message: "Denver - AQI: 78 (Moderate)",
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-97.7431, 30.2672],
            },
            properties: {
              label: "Austin",
              color: "#3F51B5",
              aqi: 45,
              message: "Austin - AQI: 45 (Good)",
            },
          },
        ],
      };

      // 6) Log any geocoder errors
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
        <div>
          {" "}
          <AQIBar aqi={selectedAQI} location={selectedLocation} />
        </div>
      </div>
    </div>
  );
}
