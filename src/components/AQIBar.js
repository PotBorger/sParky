import React, { useRef, useEffect, useState } from 'react';
import "./AQIBar.css";

const segments = [
  { label: "Good",           color: "#2ED572", range:  50, description: "Air quality is satisfactory" },
  { label: "Moderate",       color: "#FFD93D", range:  50, description: "Acceptable for most people" },
  { label: "Unhealthy SG",   color: "#FF9F1C", range:  50, description: "Sensitive groups may experience symptoms" },
  { label: "Unhealthy",      color: "#FF4D6D", range:  50, description: "Everyone may experience health effects" },
  { label: "Very Unhealthy", color: "#A22448", range: 100, description: "Health warnings of emergency conditions" },
  { label: "Hazardous",      color: "#6A0572", range: 250, description: "Emergency conditions affect everyone" }
];

function getAQILevel(aqi) {
  let cumulative = 0;
  for (let i = 0; i < segments.length; i++) {
    cumulative += segments[i].range;
    if (aqi <= cumulative) {
      return segments[i];
    }
  }
  return segments[segments.length - 1];
}

export default function AQIBar({ aqi, location }) {
  const fillRef    = useRef();
  const pointerRef = useRef();

  useEffect(() => {
  if (aqi == null) return;

  // 1) figure out exact pointer pct (0–1) and category
  const pct    = Math.min(Math.max(aqi, 0), 500) / 500;
  const { label, color, description } = getAQILevel(aqi);

  // 2) decide the discrete fill fraction
  let frac;
  if (label === "Good")      frac = 1/3;
  else if (label === "Moderate") frac = 2/3;
  else                         frac = 1;

  // ——— HERE: set the solid fill color & target width ———
  fillRef.current.style.backgroundColor = color;
  fillRef.current.style.width           = `0%`;  // start from zero

  // 3) reset both fill and pointer instantly
  fillRef.current.style.transition    = 'none';
  pointerRef.current.style.transition = 'none';
  pointerRef.current.style.left       = '0%';
  pointerRef.current.style.borderColor = color;


  // 4) next frame: animate to your frac & pointer pct
  requestAnimationFrame(() => {
    // fill
    fillRef.current.style.transition = 'width 1.5s cubic-bezier(0.4,0,0.2,1)';
    fillRef.current.style.width      = `${frac * 100}%`;


    // pointer
    pointerRef.current.style.transition = 'left 1.5s cubic-bezier(0.4,0,0.2,1)';
    pointerRef.current.style.left       = `${frac * 100}%`;
  });
  }, [aqi]);

  if (aqi == null) return null;

  const { label, color, description } = getAQILevel(aqi);

  // Dynamic fill: 1/3 for Good, 2/3 for Moderate, 100% otherwise
  let fillFrac;
  if (label === "Good") fillFrac = 1 / 3;
  else if (label === "Moderate") fillFrac = 2 / 3;
  else fillFrac = 1;

  return (
    <div className="aqi-bar-container" style={{ border: `1px solid ${color}` }}>
      <div className = "aqi-location">{location || "Click  a marker to see AQI"}</div>

      <div className="fire-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>

      <div className="aqi-header">
        <div className="aqi-main-label">
          <span className="aqi-value">PM2.5 AQI: {aqi}</span>
        <span className="aqi-level" style={{ color: getAQILevel(aqi).color }}>
            {label}
        </span>
        </div>
        <div className="aqi-controls">
          <button className="aqi-expand-btn">Expand</button>
          <button className="aqi-close-btn">Close</button>
        </div>
      </div>

     <div className="aqi-chart-section">
        <div className="aqi-bar-segments">
          {segments.map(seg => (
            <div
              key={seg.label}
              className="aqi-segment"
              style={{ flex: seg.range / 500 }}
            />
          ))}

          {/* the fill that grows */}
          <div
            ref={fillRef}
            className="aqi-progress-fill"
          />

          {/* the pointer that rides the end */}
          <div
            ref={pointerRef}
            className="aqi-bar-pointer"
            style={{ borderColor: color }}
          />
        </div>
      </div>

      <div className="aqi-recommendation">
        <div className="aqi-advice">
          <strong>Health Advisory:</strong> {description}. Consider limiting
          outdoor activities if sensitive to air pollution.
        </div>
      </div>
    </div>
  );
}
