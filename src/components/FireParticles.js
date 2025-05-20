// FireParticles.js
import React, { useMemo } from 'react';
import './FireForesight.css';

export default function FireParticles() {
  // Pre-generate random positions & timings once
  const particles = useMemo(() => 
    Array.from({ length: 6 }).map(() => ({
      left: `${10 + Math.random() * 80}%`,
      top: `${10 + Math.random() * 80}%`,
      animationDuration: `${3 + Math.random() * 5}s`,
      animationDelay: `${Math.random() * 2}s`,
    }))
  , []);

  return (
    <div className="fire-particles">
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
