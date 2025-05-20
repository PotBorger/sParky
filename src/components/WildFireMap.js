// src/Map.jsx
import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./FireForesight.css";  // we’ll add the CSS rules here

export default function Map() {
  const mapContainer = useRef(null);

  useEffect(() => {
    const apiKey = "…";        // your real key here
    const region = "us-east-1";
    const styleName = "Standard";
    const colorScheme = "Dark";

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://maps.geo.${region}.amazonaws.com/v2/styles/${styleName}/descriptor?key=${apiKey}&color-scheme=${colorScheme}`,
      center: [-111.876183, 40.758701],
      zoom: 10,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-left");
    return () => map.remove();
  }, []);

  return (
    <div className="map-page-container">
      <div className="map-wrapper">
        <div ref={mapContainer} className="map-container" />
      </div>
    </div>
  );
}
