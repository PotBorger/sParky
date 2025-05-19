export default function AirQualityIndicator() {
  // In a real app, this would come from an API or context
  const quality = 75;

  return (
    <div className="air-quality-container">
      <div className="air-quality-header">
        <span>Air Quality</span>
        <span>{quality}% Good</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${quality}%` }} />
      </div>
    </div>
  );
}
