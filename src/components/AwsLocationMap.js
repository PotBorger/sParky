// AwsLocationMap.js
import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const AwsLocationMap = ({
  apiKey,
  region = 'us-east-1',
  style = 'Standard',          // ← AWS map style name
  colorScheme = 'Light',
  center = [-123.115898, 49.295868],
  zoom = 11,
  containerStyle = { width: '100%', height: '60vh' }, // CSS for the map <div>
  ...props
}) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!apiKey) {
      console.error('AWS Location Service API key is required.');
      return;
    }

    if (!mapInstance.current && mapContainer.current) {
      mapInstance.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://maps.geo.${region}.amazonaws.com/v2/styles/${style}/descriptor?key=${apiKey}&color-scheme=${colorScheme}`,
        center,
        zoom,
      });
      mapInstance.current.addControl(new maplibregl.NavigationControl(), 'top-left');
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [apiKey, region, style, colorScheme, center, zoom]);

  return <div ref={mapContainer} style={containerStyle} {...props} />;
};

export default AwsLocationMap;
