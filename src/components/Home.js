import React from "react";
import "./FireForesight.css";
import TechBadge from "./TechBadge";
import FireParticles from "./FireParticles";
// Button component with arrow icon
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

// Secondary button component
// const SecondaryButton = ({ text }) => (
//   <button className="secondary-button">{text}</button>
// );

// Background particles for visual effect

// Air quality indicator with progress bar
// const AirQualityIndicator = () => {
//   // In a real app, this would come from an API or context
//   const quality = 75;

//   return (
//     <div className="air-quality-container">
//       <div className="air-quality-header">
//         <span>Air Quality</span>
//         <span>{quality}% Good</span>
//       </div>
//       <div className="progress-bar-bg">
//         <div className="progress-bar-fill" style={{ width: `${quality}%` }} />
//       </div>
//     </div>
//   );
// };

// Page title component with gradient text
const PageTitle = ({ children }) => (
  <div className="page-title-container">
    <h1 className="page-title">{children}</h1>
  </div>
);

// Main home component
export default function Home() {
  return (
    <div className="home-container">
      <section className="main-section">
        <FireParticles />
        <div className="content-container">
          <TechBadge className="tech-badge" text="Forecasts Made With AI" />
          <PageTitle>Fire Foresight. Clean Air Insight.</PageTitle>

          <p className="main-description">
            Predict wildfires before they ignite and know how they'll impact
            your air.
          </p>

          <div className="buttons-container">
            <FlameButton text="Get Started" />
            {/* <SecondaryButton text="View Air Quality Map" /> */}
          </div>
        </div>
      </section>
    </div>
  );
}
