// src/components/Home.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FireForesight.css";
import TechBadge from "./TechBadge";
import FireParticles from "./FireParticles";

// Button component with arrow icon
const FlameButton = ({ text, onClick }) => (
  <button className="flame-button" onClick={onClick}>
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

const PageTitle = ({ children }) => (
  <div className="page-title-container">
    <h1 className="page-title">{children}</h1>
  </div>
);

export default function Home() {
  const [showInput, setShowInput] = useState(false);
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setShowInput(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && address.trim() !== "") {
      // Redirect to /map (you can also pass the address via state or query)
      navigate("/map");
    }
  };

  return (
    <div className="home-container">
      <section className="main-section">
        <FireParticles />
        <div className="content-container">
          <TechBadge className="tech-badge" text="Forecasts Made With AI" />
          <PageTitle>Fire Foresight. Clean Air Insight.</PageTitle>
          <p className="main-description">
            Predict wildfires before they ignite and know how they'll impact your air.
          </p>

          <div className="buttons-container">
            <FlameButton text="Get Started" onClick={handleGetStarted} />
          </div>

          {showInput && (
            <div className="address-input-box">
              <input
                type="text"
                className="address-input"
                placeholder="Enter your address and press Enter"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
