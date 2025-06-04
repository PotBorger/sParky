// // src/AQIBar.jsx

// import React, { useRef, useEffect, useState } from 'react';
// import "./AQIBar.css";

// const segments = [
//   { label: "Good",           color: "#2ED572", range:  50, description: "Air quality is satisfactory" },
//   { label: "Moderate",       color: "#FFD93D", range:  50, description: "Acceptable for most people" },
//   { label: "Unhealthy SG",   color: "#FF9F1C", range:  50, description: "Sensitive groups may experience symptoms" },
//   { label: "Unhealthy",      color: "#FF4D6D", range:  50, description: "Everyone may experience health effects" },
//   { label: "Very Unhealthy", color: "#A22448", range: 100, description: "Health warnings of emergency conditions" },
//   { label: "Hazardous",      color: "#6A0572", range: 250, description: "Emergency conditions affect everyone" }
// ];

// function getAQILevel(aqi) {
//   let cumulative = 0;
//   for (let i = 0; i < segments.length; i++) {
//     cumulative += segments[i].range;
//     if (aqi <= cumulative) {
//       return segments[i];
//     }
//   }
//   return segments[segments.length - 1];
// }

// export default function AQIBar({ aqi, location }) {
//   const fillRef    = useRef();
//   const pointerRef = useRef();
//   const [expanded, setExpanded]     = useState(false);
//   const [visible,  setVisible]      = useState(true);
//   const [wildfireData, setWildfireData] = useState(null); // will hold the fetched JSON

//   // Whenever AQI or location changes, re-show the bar and re-fetch JSON
//   useEffect(() => {
//     if (aqi != null) {
//       setVisible(true);

//       // Fetch the JSON from public/response.json
//       fetch('/response.json')
//         .then(res => {
//           if (!res.ok) throw new Error(`HTTP ${res.status}`);
//           return res.json();
//         })
//         .then(data => {
//           setWildfireData(data);
//         })
//         .catch(err => {
//           console.error("Failed to load wildfire data:", err);
//           setWildfireData(null);
//         });
//     }
//   }, [aqi, location]);

//   // Bar‐fill animation (same as before)
//   useEffect(() => {
//     if (aqi == null) return;
//     if (!fillRef.current || !pointerRef.current) return;

//     const { label, color } = getAQILevel(aqi);
//     const frac = label === "Good"
//       ? 1/3
//       : label === "Moderate"
//         ? 2/3
//         : 1;

//     // reset
//     fillRef.current.style.backgroundColor = color;
//     fillRef.current.style.width           = '0%';
//     fillRef.current.style.transition      = 'none';
//     pointerRef.current.style.transition   = 'none';
//     pointerRef.current.style.left         = '0%';
//     pointerRef.current.style.borderColor  = color;

//     // animate
//     requestAnimationFrame(() => {
//       fillRef.current.style.transition    = 'width 1.5s cubic-bezier(0.4,0,0.2,1)';
//       fillRef.current.style.width         = `${frac * 100}%`;
//       pointerRef.current.style.transition = 'left 1.5s cubic-bezier(0.4,0,0.2,1)';
//       pointerRef.current.style.left       = `${frac * 100}%`;
//     });
//   }, [aqi]);

//   if (!visible || aqi == null) return null;

//   const { label, color, description } = getAQILevel(aqi);

//   return (
//     <div
//       className={`aqi-bar-container${expanded ? ' expanded' : ''}`}
//       style={{ border: `1px solid ${color}` }}
//     >
//       <div className="aqi-location">
//         {location || "Click a marker to see AQI"}
//       </div>

//       <div className="fire-particles">
//         {[...Array(12)].map((_, i) => (
//           <div key={i} className={`particle particle-${i+1}`}></div>
//         ))}
//       </div>

//       <div className="aqi-header">
//         <div className="aqi-main-label">
//           <span className="aqi-value">PM2.5 AQI: {aqi}</span>
//           <span className="aqi-level" style={{ color }}>{label}</span>
//         </div>
//         <div className="aqi-controls">
//           <button
//             className="aqi-expand-btn"
//             onClick={() => setExpanded(e => !e)}
//           >
//             {expanded ? 'Minimize' : 'Expand'}
//           </button>
//           <button
//             className="aqi-close-btn"
//             onClick={() => setVisible(false)}
//           >
//             Close
//           </button>
//         </div>
//       </div>

//       <div className="aqi-chart-section">
//         <div className="aqi-bar-segments">
//           {segments.map(seg => (
//             <div
//               key={seg.label}
//               className="aqi-segment"
//               style={{ flex: seg.range / 500 }}
//             />
//           ))}
//           <div ref={fillRef} className="aqi-progress-fill" />
//           <div
//             ref={pointerRef}
//             className="aqi-bar-pointer"
//             style={{ borderColor: color }}
//           />
//         </div>
//       </div>

//       <div className="aqi-recommendation">
//         <div className="aqi-advice">
//           <strong>Health Advisory:</strong> {description}. Consider limiting
//           outdoor activities if you’re sensitive to air pollution.
//         </div>
//       </div>

//       <div className="aqi-expand-section">
//         <h3>Wildfire Impact Details</h3>

//         {/* Only render once we have wildfireData */}
//         {wildfireData ? (
//           <div className="expand-content">
//             <p><strong>Impacted AQI:</strong> {wildfireData.impactedAQI}</p>
//             <p><strong>Description:</strong> {wildfireData.description}</p>
//             <div className="advice-list">
//               <strong>Advice:</strong>
//               <ul>
//                 {wildfireData.advice.map((item, idx) => (
//                   <li key={idx}>{item}</li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         ) : (
//           <p style={{ color: '#ccc', fontStyle: 'italic' }}>
//             Loading wildfire data…
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }
// src/AQIBar.jsx

import React, { useRef, useEffect, useState } from "react";
import "./AQIBar.css";

const segments = [
  {
    label: "Good",
    color: "#2ED572",
    range: 50,
    description: "Air quality is satisfactory",
  },
  {
    label: "Moderate",
    color: "#FFD93D",
    range: 50,
    description: "Acceptable for most people",
  },
  {
    label: "Unhealthy SG",
    color: "#FF9F1C",
    range: 50,
    description: "Sensitive groups may experience symptoms",
  },
  {
    label: "Unhealthy",
    color: "#FF4D6D",
    range: 50,
    description: "Everyone may experience health effects",
  },
  {
    label: "Very Unhealthy",
    color: "#A22448",
    range: 100,
    description: "Health warnings of emergency conditions",
  },
  {
    label: "Hazardous",
    color: "#6A0572",
    range: 250,
    description: "Emergency conditions affect everyone",
  },
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

export default function AQIBar({
  probability, // probability of wildfire (0-100)
  currentAQI, // current user AQI value
  impactedAQI, // how fire might affect AQI
  location, // location name
  advice = [], // array of advice strings
}) {
  const fillRef = useRef();
  const pointerRef = useRef();
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);

  // Whenever currentAQI or location changes, re-show the bar
  useEffect(() => {
    if (currentAQI != null) {
      setVisible(true);
    }
  }, [currentAQI, location]);

  // Bar‐fill animation (same as before but using currentAQI)
  useEffect(() => {
    if (currentAQI == null) return;
    if (!fillRef.current || !pointerRef.current) return;

    const { label, color } = getAQILevel(currentAQI);
    const frac = label === "Good" ? 1 / 3 : label === "Moderate" ? 2 / 3 : 1;

    // reset
    fillRef.current.style.backgroundColor = color;
    fillRef.current.style.width = "0%";
    fillRef.current.style.transition = "none";
    pointerRef.current.style.transition = "none";
    pointerRef.current.style.left = "0%";
    pointerRef.current.style.borderColor = color;

    // animate
    requestAnimationFrame(() => {
      fillRef.current.style.transition = "width 1.5s cubic-bezier(0.4,0,0.2,1)";
      fillRef.current.style.width = `${frac * 100}%`;
      pointerRef.current.style.transition =
        "left 1.5s cubic-bezier(0.4,0,0.2,1)";
      pointerRef.current.style.left = `${frac * 100}%`;
    });
  }, [currentAQI]);

  if (!visible || currentAQI == null) return null;

  const { label, color, description } = getAQILevel(currentAQI);

  // Determine probability level styling
  const getProbabilityColor = (prob) => {
    if (prob >= 80) return "#6A0572"; // Hazardous purple
    if (prob >= 60) return "#A22448"; // Very Unhealthy dark red
    if (prob >= 40) return "#FF4D6D"; // Unhealthy red
    if (prob >= 20) return "#FF9F1C"; // Unhealthy SG orange
    return "#FFD93D"; // Moderate yellow
  };

  const getProbabilityLabel = (prob) => {
    if (prob >= 80) return "Very High";
    if (prob >= 60) return "High";
    if (prob >= 40) return "Moderate";
    if (prob >= 20) return "Low";
    return "Very Low";
  };

  const probabilityColor = getProbabilityColor(probability);
  const probabilityLabel = getProbabilityLabel(probability);

  return (
    <div
      className={`aqi-bar-container${expanded ? " expanded" : ""}`}
      style={{ border: `1px solid ${color}` }}
    >
      <div className="aqi-location">
        {location || "Click a marker to see AQI"}
      </div>

      <div className="fire-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>

      <div className="aqi-header">
        <div className="aqi-main-label">
          <span className="aqi-value">PM2.5 AQI: {currentAQI}</span>
          <span className="aqi-level" style={{ color }}>
            {label}
          </span>
          <span
            className="wildfire-probability"
            style={{
              color: probabilityColor,
              fontSize: "14px",
              marginTop: "4px",
            }}
          >
            Wildfire Risk: {probability}% ({probabilityLabel})
          </span>
        </div>
        <div className="aqi-controls">
          <button
            className="aqi-expand-btn"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? "Minimize" : "Expand"}
          </button>
          <button className="aqi-close-btn" onClick={() => setVisible(false)}>
            Close
          </button>
        </div>
      </div>

      <div className="aqi-chart-section">
        <div className="aqi-bar-segments">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className="aqi-segment"
              style={{ flex: seg.range / 500 }}
            />
          ))}
          <div ref={fillRef} className="aqi-progress-fill" />
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
          outdoor activities if you're sensitive to air pollution.
        </div>
      </div>

      <div className="aqi-expand-section">
        <h3>Wildfire Impact Details</h3>

        <div className="expand-content">
          <p>
            <strong>Current AQI:</strong> {currentAQI}
          </p>
          <p>
            <strong>Wildfire Probability:</strong> {probability}% (
            {probabilityLabel})
          </p>
          {impactedAQI && (
            <p>
              <strong>Potential AQI if fire occurs:</strong> {impactedAQI}
            </p>
          )}

          {advice && advice.length > 0 && (
            <div className="advice-list">
              <strong>Safety Recommendations:</strong>
              <ul>
                {advice.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {(!advice || advice.length === 0) && (
            <p style={{ color: "#ccc", fontStyle: "italic" }}>
              No specific advice available at this time.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
