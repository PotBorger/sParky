import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./FireForesight.css";
import TechBadge from "./TechBadge.js";
import FireParticles from "./FireParticles.js";

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
  const [initialLocation, setInitialLocation] = useState("");
  const [loadingGeo, setLoadingGeo] = useState(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        // round to 4 decimals for brevity
        setInitialLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setLoadingGeo(false);
      },
      (err) => {
        console.error("Geo error:", err);
        alert("Unable to retrieve location");
        setLoadingGeo(false);
      }
    );
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
            <input
              type="text"
              className="address-input"
              placeholder="Enter a location"
              value={initialLocation}
              onChange={(e) => setInitialLocation(e.target.value)}
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
            <Link
              to={`/map?initialLocation=${encodeURIComponent(initialLocation)}`}
            >
              <FlameButton text="Get Started" disabled={!initialLocation} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
