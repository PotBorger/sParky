// src/components/Home.js

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./FireForesight.css";
import TechBadge from "./TechBadge";
import FireParticles from "./FireParticles";

/** Button with flame arrow */
const FlameButton = ({ text }) => (
  <button className="flame-button">
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
    <span className="button-highlight"></span>
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

  return (
    <div className="home-container">
      {/* Move FireParticles here so it covers the full viewport */}
      <FireParticles />

      <section className="main-section">
        <div className="content-container">
          <TechBadge className="tech-badge" text="Forecasts Made With AI" />
          <PageTitle>Fire Foresight. Clean Air Insight.</PageTitle>

          <p className="main-description">
            Predict wildfires before they ignite and know how they'll impact
            your air.
          </p>

          {/* Address input, centered under the button */}
          <div className="address-input-box">
            <input
              type="text"
              className="address-input"
              placeholder="Enter a location"
              value={initialLocation}
              onChange={(e) => setInitialLocation(e.target.value)}
            />
          </div>

          <div className="buttons-container">
            <Link
              to={`/map?initialLocation=${encodeURIComponent(
                initialLocation
              )}`}
            >
              <FlameButton text="Get Started" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
