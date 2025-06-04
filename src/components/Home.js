import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./FireForesight.css";
import TechBadge from "./TechBadge.js";
import FireParticles from "./FireParticles.js";
import SecondaryButton from "./SecondaryButton.js";

/** Button with flame arrow */
const FlameButton = ({ text, disabled }) => (
  <button className="flame-button" disabled={disabled}>
    <span className="button-content">
      {text}
      <svg
        className="arrow-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    </span>
    <span className="button-highlight" />
  </button>
);

/** Page title styling */
const PageTitle = ({ children }) => (
  <div className="page-title-container">
    <h1 className="page-title">{children}</h1>
  </div>
);

export default function Home() {
  // Separate state for lat / lon
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loadingGeo, setLoadingGeo] = useState(false);

  // Optional: if you want the user to type in their own coords,
  // keep them in sync with the two state vars:
  const handleManualChange = (e) => {
    const [latStr, lonStr] = e.target.value.split(",").map((s) => s.trim());
    setLatitude(latStr);
    setLongitude(lonStr);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        // round to 4 decimals for display
        setLatitude(coords.latitude.toFixed(4));
        setLongitude(coords.longitude.toFixed(4));
        setLoadingGeo(false);
      },
      (err) => {
        console.error("Geo error:", err);
        alert("Unable to retrieve location");
        setLoadingGeo(false);
      }
    );
  };

  const fetchAQ = async () => {
    if (!latitude || !longitude) {
      alert("You need a latitude and longitude first");
      return;
    }

    try {
      // include lat & lon as query params
      const response = await axios.get(
        `http://localhost:5001/api/currentAQ?lat=${latitude}&lon=${longitude}`
      );
      console.log("AQ result:", response.data);
      // …do something with response.data.result…
    } catch (error) {
      console.error("API error:", error.response?.status, error.message);
    }
  };


  const fetchDataClimate = async () => {
     if (!latitude || !longitude) {
      alert("You need a latitude and longitude first");
      return;
    }

    try{
      const response = await axios.get(
        `http://localhost:5001/api/currentDataClimate?lat=${latitude}&lon=${longitude}`
      );
      console.log("Climate result:", response.data);
    }catch(error){
      console.error("API error", error.response?.status, error.message);
    }
  };

  return (
    <div className="home-container">
      <FireParticles />

      <section className="main-section">
        <div className="content-container">
          <TechBadge className="tech-badge" text="Forecasts Made With AI" />
          <PageTitle>Fire Foresight. Clean Air Insight.</PageTitle>

          <p className="main-description">
            Predict wildfires before they ignite and know how they'll impact
            your air.
          </p>

          <div className="address-input-box">
            {/* Show “lat, lon” as a single string; onChange splits them back into state */}
            <input
              type="text"
              className="address-input"
              placeholder="Enter lat, lon"
              value={latitude && longitude ? `${latitude}, ${longitude}` : ""}
              onChange={handleManualChange}
            />
            <button
              className="geo-btn"
              onClick={handleUseMyLocation}
              disabled={loadingGeo}
              title={loadingGeo ? "Locating…" : "Use my current location"}
            >
              {loadingGeo ? "⏳" : "📍"}
            </button>
          </div>

          <div className="buttons-container">
            {/* When you Link to /map, you can pass lat/lon as well */}
            <Link to={`/map?lat=${latitude}&lon=${longitude}`}>
              <FlameButton
                text="Get Started"
                disabled={!latitude || !longitude}
              />
            </Link>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <SecondaryButton text="Check AQ" onClick={fetchAQ} />
          </div>


          <div style={{ marginTop: "1rem" }}>
            <SecondaryButton text="Check DataClimate" onClick={fetchDataClimate} />
          </div>
          
        </div>
      </section>
    </div>
  );
}
