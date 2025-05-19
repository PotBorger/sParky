export default function FireParticles() {
  return (
    <div className="fire-particles">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${
              i % 2 === 0 ? 50 + 0.5 * 80 - i * 4 : 0 + 0.5 * 40 + i * 4
            }%`,
            top: `${20 + Math.random() * 80}%`,
            animationDuration: `${3 + Math.random() * 5}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
