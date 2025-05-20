// src/Map.jsx
import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./FireForesight.css"; 


export default function Map() {

  const mapContainer = useRef(null);
  useEffect(() => {
    const apiKey = "concacmemay"
      const region = "us-east-2";
      const styleName = "Standard";
      const colorScheme = "Dark";

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://maps.geo.${region}.amazonaws.com/v2/styles/${styleName}/descriptor?key=${apiKey}&color-scheme=${colorScheme}`,
      center: [-123.115898, 49.295868],
      zoom: 11
    });

    map.addControl(new maplibregl.NavigationControl(), "top-left");

    return () => map.remove();
  }, []);
  return <div ref={mapContainer} className="map-container" />;
}
