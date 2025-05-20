// src/components/WildFireMap.js
import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";

import { withAPIKey } from "@aws/amazon-location-utilities-auth-helper";
import { GeoPlacesClient } from "@aws-sdk/client-geo-places";

import GeoPlaces from "../util.js";       // ← updated path
import "../components/FireForesight.css";

export default function WildFireMap() {
  const mapContainer = useRef(null);

  useEffect(() => {
    let map;

    (async () => {
      const API_KEY    = "v1.public.eyJqdGkiOiIzNmM1MzNhZS1hNWJmLTQyMTktYThkMS0zMjg4MzAyNjA4ZjAifZPWOa39wtCGvDjJmttFwCm4zkdalftZs3Ji3RAX9kVSZkOAdYa-7_PpYqIgNpEo9fdQKETt_WfZMIocXxq0KBLKs4xTRDnOHPAvvvMJC7JaPjqOALbfhA8r4EQQExAUwAFeSiS0akLbGQMtbAqM3kbjCed4terPXAlWgaoUy2QqOLdG0Rn3NcS-ejaPoqViRsHIb68iE0LVwhQk7_ZR--d5QKTQSCzWW0drXW8xEnebgXAhD1nJG7b5KqdhlAKBzUouGoPCuTzZrTGThxXeDfjd7AOi_5rD4zFA9rNbe4drOiUFrC5fNihCKVLj1Y9lqBKxyE5wgu7q-2AzoYTpOCs.ZWU0ZWIzMTktMWRhNi00Mzg0LTllMzYtNzlmMDU3MjRmYTkx" || "YOUR_API_KEY";
      const AWS_REGION = "us-east-1" || "us-east-1";

      // 1️⃣ initialize the map
      map = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/Standard/descriptor?key=${API_KEY}&color-scheme=Dark`,
        center: [-111.876183, 40.758701],
        zoom: 10,
        validateStyle: false,
      });
      map.addControl(new maplibregl.NavigationControl(), "top-left");

      // 2️⃣ create AWS Places client + adapter
      const authHelper     = withAPIKey(API_KEY, AWS_REGION);
      const placesClient   = new GeoPlacesClient(authHelper.getClientConfig());
      const geoPlaces      = new GeoPlaces(placesClient, map);

      // 3️⃣ add the geocoder control
      const geocoder = new MaplibreGeocoder(geoPlaces, {
        maplibregl,
        showResultsWhileTyping: true,
        debounceSearch: 300,
        limit: 5,
        popuprender: (feature) => `
          <div class="popup-content">
            <strong>${feature.place_name}</strong><br/>
            <span class="${feature.place_type.toLowerCase()} badge">${feature.place_type}</span>
          </div>`,
        placeholder: "Search address or place…",
        zoom: 14,
      });
      map.addControl(geocoder, "top-left");

      // log any internal geocoder errors
      geocoder.on("error", (err) => console.error("Geocoder error:", err));

      // 4️⃣ fly to result on select
      geocoder.on("result", ({ result }) => {
        map.flyTo({
          center: result.geometry.coordinates,
          zoom: 14,
          speed: 1.2,
        });
      });
    })();

    return () => map?.remove();
  }, []);

  return (
    <div className="map-page-container">
      <div className="map-wrapper">
        <div ref={mapContainer} className="map-container" />
      </div>
    </div>
  );
}
