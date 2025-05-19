export default function TechBadge({ text }) {
  return (
    <div className="tech-badge">
      <span className="pulse-container">
        <span className="pulse-ping"></span>
        <span className="pulse-dot"></span>
      </span>
      {text}
    </div>
  );
}
