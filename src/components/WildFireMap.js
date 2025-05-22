// src/components/WildFireMap.js
import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";

import { withAPIKey } from "@aws/amazon-location-utilities-auth-helper";
import { GeoPlacesClient } from "@aws-sdk/client-geo-places";

import GeoPlaces from "../util.js";
import "../components/FireForesight.css";

import { useLocation } from "react-router-dom";

export default function WildFireMap() {
  const mapContainer = useRef(null);
  const { search } = useLocation();
  const initialLocation = new URLSearchParams(search).get("initialLocation");

  useEffect(() => {
    let map, geocoderControl;

    (async () => {
      const API_KEY =
        process.env.REACT_APP_AWS_API_KEY ||
        "v1.public.eyJqdGkiOiIzNmM1MzNhZS1hNWJmLTQyMTktYThkMS0zMjg4MzAyNjA4ZjAifZPWOa39wtCGvDjJmttFwCm4zkdalftZs3Ji3RAX9kVSZkOAdYa-7_PpYqIgNpEo9fdQKETt_WfZMIocXxq0KBLKs4xTRDnOHPAvvvMJC7JaPjqOALbfhA8r4EQQExAUwAFeSiS0akLbGQMtbAqM3kbjCed4terPXAlWgaoUy2QqOLdG0Rn3NcS-ejaPoqViRsHIb68iE0LVwhQk7_ZR--d5QKTQSCzWW0drXW8xEnebgXAhD1nJG7b5KqdhlAKBzUouGoPCuTzZrTGThxXeDfjd7AOi_5rD4zFA9rNbe4drOiUFrC5fNihCKVLj1Y9lqBKxyE5wgu7q-2AzoYTpOCs.ZWU0ZWIzMTktMWRhNi00Mzg0LTllMzYtNzlmMDU3MjRmYTkx";
      const AWS_REGION = process.env.REACT_APP_AWS_REGION || "us-east-1";

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

      // 3) Add the geocoder (search) control
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
      });
      map.addControl(geocoderControl, "bottom-right");

      // 4) Fly on initial load if we have a param
      if (initialLocation) {
        geocoderControl.query(initialLocation);
      }

      // 5) Fly on every selection thereafter
      geocoderControl.on("result", ({ result }) => {
        map.flyTo({
          center: result.geometry.coordinates,
          zoom: 14,
          speed: 1.2,
        });
      });
      // at the top of WildFireMap.js, before your useEffect:
      const flameUrl = `localhost:3000/assets/images/flame-img.png`;
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
              label: "Patna",
              color: "#FF5722",
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
        el.addEventListener("click", () => {
          window.alert(marker.properties.message);
        });

        // add marker to map
        new maplibregl.Marker({ element: el })
          .setLngLat(marker.geometry.coordinates)
          .addTo(map);
      });
    })();

    return () => map?.remove();
  }, [initialLocation]);

  return (
    <div className="map-page-container">
      <div className="map-wrapper">
        <div ref={mapContainer} className="map-container" />
      </div>
    </div>
  );
}
