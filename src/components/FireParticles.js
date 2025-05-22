// src/components/FireParticles.js
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import './FireForesight.css';

export default function FireParticles() {
  const { pathname } = useLocation();
  // only show embers on the root path
  if (pathname !== '/') return null;

  // generate 50 random embers
  const sparks = useMemo(
    () =>
      Array.from({ length: 50 }).map(() => ({
        left: `${Math.random() * 100}%`,
        size: `${1 + Math.random() * 3}px`,
        duration: `${3 + Math.random() * 4}s`,
        delay: `${-Math.random() * 5}s`,
      })),
    []
  );

  return (
    <div className="fire-particles">
      {sparks.map((s, i) => (
        <div
          key={i}
          className="ember"
          style={{
            left: s.left,
            width: s.size,
            height: s.size,
            animationDuration: s.duration,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}
