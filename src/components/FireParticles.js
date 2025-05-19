export default function FireParticles() {
  return (
    <div className="fire-particles">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${i % 2 === 0 ? 90 - i * 4 : 10 + i * 2}%`,
            top: `${
              i % 2 === 0 ? 50 + 0.5 * 40 - i * 3 : 0 + 0.5 * 40 + i * 8
            }%`,
            animationDuration: `${3 + Math.random() * 5}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
