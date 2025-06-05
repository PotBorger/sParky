import React, { useRef, useEffect, useState } from "react";
import "./AQIBar.css";

const segments = [
  {
    label: "Good",
    color: "#2ED572",
    range: 1,
    description: "Air quality is satisfactory",
  },
  {
    label: "Fair",
    color: "#FFD93D",
    range: 2,
    description: "Acceptable for most people",
  },
  {
    label: "Moderate",
    color: "#FF9F1C",
    range: 3,
    description: "Sensitive groups may experience symptoms",
  },
  {
    label: "Unhealthy",
    color: "#FF4D6D",
    range: 4,
    description: "Everyone may experience health effects",
  },
  {
    label: "Hazardous",
    color: "#6A0572",
    range: 5,
    description: "Emergency conditions affect everyone",
  },
];

// Changed to exact‐match rather than cumulative
function getAQILevel(aqi) {
  const match = segments.find((seg) => seg.range === aqi);
  return match || segments[segments.length - 1];
}

export default function AQIBar({
  probability,
  currentAQI,
  impactedAQI,
  location,
  advice = [],
  healthDescription = "",
}) {
  const fillRef = useRef();
  const pointerRef = useRef();
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (currentAQI != null) {
      setVisible(true);
    }
  }, [currentAQI, location]);

  // Animate based on currentAQI (unchanged)
  useEffect(() => {
    if (currentAQI == null) return;
    if (!fillRef.current || !pointerRef.current) return;

    const { label: currLabel, color: currColor } = getAQILevel(currentAQI);
    // You can keep whatever fraction logic you want here (for example (index+1)/segments.length)
    // But if you only ever want to show a single “snapshot” (no smooth partial fill), you could do:
    const index = segments.findIndex((seg) => seg.range === currentAQI);
    const fraction = (index + 1) / segments.length;

    // reset
    fillRef.current.style.backgroundColor = currColor;
    fillRef.current.style.width = "0%";
    fillRef.current.style.transition = "none";
    pointerRef.current.style.transition = "none";
    pointerRef.current.style.left = "0%";
    pointerRef.current.style.borderColor = currColor;

    // animate
    requestAnimationFrame(() => {
      const targetPct = fraction * 100; // e.g. 20%, 40%, 60%, 80%, or 100%
      fillRef.current.style.transition = "width 1.5s cubic-bezier(0.4,0,0.2,1)";
      fillRef.current.style.width = `${targetPct}%`;
      pointerRef.current.style.transition =
        "left 1.5s cubic-bezier(0.4,0,0.2,1)";
      pointerRef.current.style.left = `${targetPct}%`;
    });
  }, [currentAQI]);

  // Animate based on impactedAQI (now uses exact match as well)
  useEffect(() => {
    if (impactedAQI == null) return;
    if (!fillRef.current || !pointerRef.current) return;

    // 1) Grab the correct label/colors for this exact impactedAQI
    const { label: impactLabel, color: impactColor } = getAQILevel(impactedAQI);
    // 2) Compute fraction = (index+1) / total segments
    const impactedIndex = segments.findIndex(
      (seg) => seg.range === impactedAQI
    );
    const clampedIndex =
      impactedIndex < 0 ? segments.length - 1 : impactedIndex;
    const fraction = (clampedIndex + 1) / segments.length;

    // reset
    fillRef.current.style.backgroundColor = impactColor;
    fillRef.current.style.width = "0%";
    fillRef.current.style.transition = "none";
    pointerRef.current.style.transition = "none";
    pointerRef.current.style.left = "0%";
    pointerRef.current.style.borderColor = impactColor;

    // animate
    requestAnimationFrame(() => {
      const targetPct = fraction * 100;
      fillRef.current.style.transition = "width 1.5s cubic-bezier(0.4,0,0.2,1)";
      fillRef.current.style.width = `${targetPct}%`;
      pointerRef.current.style.transition =
        "left 1.5s cubic-bezier(0.4,0,0.2,1)";
      pointerRef.current.style.left = `${targetPct}%`;
    });
  }, [impactedAQI]);

  if (!visible || currentAQI == null) return null;

  // Get the “current” bucket’s info
  const {
    label: currLabel,
    color: currColor,
    description: currDesc,
  } = getAQILevel(currentAQI);

  // Compute impactedAQI’s label/color for rendering text
  const impactedLevel = impactedAQI != null ? getAQILevel(impactedAQI) : null;
  const impactLabel = impactedLevel ? impactedLevel.label : "";

  // Probability styling (unchanged)
  const getProbabilityColor = (prob) => {
    if (prob >= 80) return "#6A0572";
    if (prob >= 60) return "#A22448";
    if (prob >= 40) return "#FF4D6D";
    if (prob >= 20) return "#FF9F1C";
    return "#FFD93D";
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
      style={{ border: `1px solid ${currColor}` }}
    >
      <div className="aqi-location">{location || "Your current location"}</div>

      <div className="fire-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>

      <div className="aqi-header">
        <div className="aqi-main-label">
          {impactedAQI != null ? (
            <span className="aqi-value">
              Current AQI ({currentAQI}) ➠ Impacted AQI ({impactedAQI})
            </span>
          ) : (
            <span className="aqi-value">Current AQI ({currentAQI})</span>
          )}

          {/* Show “currLabel ➠ impactLabel” */}
          <span className="aqi-level" style={{ color: currColor }}>
            {currLabel}
            {impactedAQI != null && (
              <>
                &nbsp;➠&nbsp;
                <span style={{ color: impactedLevel.color }}>
                  {impactLabel}
                </span>
              </>
            )}
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
        </div>
      </div>

      <div className="aqi-chart-section">
        <div className="aqi-bar-segments">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className="aqi-segment"
              style={{
                flex: seg.range / 15 /* total range sum no longer used */,
              }}
            />
          ))}
          <div ref={fillRef} className="aqi-progress-fill" />
          <div
            ref={pointerRef}
            className="aqi-bar-pointer"
            style={{ borderColor: currColor }}
          />
        </div>
      </div>

      <div className="aqi-recommendation">
        {healthDescription !== "" && (
          <div className="aqi-advice">
            <strong>Impact To Current Air Quality If Wildfire Occurs:</strong>{" "}
            {healthDescription}
          </div>
        )}
      </div>

      <div className="aqi-expand-section">
        <h3>Wildfire Impact Details</h3>
        <div className="expand-content">
          <p>
            <strong>Current AQI:</strong> {currentAQI} ({currLabel})
          </p>
          <p>
            <strong>Wildfire Probability:</strong> {probability}% (
            {probabilityLabel})
          </p>
          {impactedAQI != null && (
            <p>
              <strong>Potential AQI if fire occurs:</strong> {impactedAQI} (
              {impactLabel})
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
