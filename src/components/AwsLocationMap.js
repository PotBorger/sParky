// AwsLocationMap.js
import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const AwsLocationMap = ({
  apiKey = 'v1.public.eyJqdGkiOiJhY2Q1OThhZi04NTFkLTRlMGEtYTI1Mi1mYTI4OWNkMGI2NGYifQg27JNcldlKnJtOcUC5ovWV1zR0zB0PP4TnnuNq90AhfNB9_7sv19zBEwvxKwT7IBNZUl_X448VxfkaQihC9fyR1jY56T5_FesG9MQrUKwK7nW4tD825L2rp6Yp_v6QmZIviCnBVQzH4c-ViCeOEqa7M3p4qImUq4Mzx16DVbC6ROr9sMnk2boYVasu0cloIhOKGbBw0oBIsmjt-HqERG5JXGhX1z5YWPKBWpB8ph4INUIstbTlzJAgTSFd9r1izSpBJ4s8ZTxhJsbWX12_JmnVgaOWcPb87dPGA8vKOfeLGCCsa-sEbNC2_XtKzJDjT8G7VSIfRhwLqP0_Vc5JgSM.NjAyMWJkZWUtMGMyOS00NmRkLThjZTMtODEyOTkzZTUyMTBi',
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
