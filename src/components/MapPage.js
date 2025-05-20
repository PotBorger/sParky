// MapPage.js
import React from "react";
import AwsLocationMap from "./AwsLocationMap";
import "./MapPage.css";

export default function MapPage() {
  return (
    <div className="map-page-container">
      <div className="map-wrapper">
        <AwsLocationMap
          apiKey="YOUR_REAL_API_KEY"
          region="us-east-1"
          style="Standard"           // ← AWS “style” prop
          colorScheme="Light"
          center={[-123.115898, 49.295868]}
          zoom={11}
          containerStyle={{ width: "100%", height: "70vh" }}
        />
      </div>
    </div>
  );
}
