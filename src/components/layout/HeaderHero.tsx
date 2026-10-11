import React from 'react';
import { ArrowRight } from 'lucide-react';

const bloomPetals = Array.from({ length: 18 }, (_, index) => index);

const FloatingBloom: React.FC = () => (
  <div className="prism-bloom-scene" aria-hidden="true">
    <svg className="prism-bloom" viewBox="0 0 320 300" fill="none">
      <defs>
        <radialGradient id="vesper-petal" cx="0" cy="0" r="1" gradientTransform="matrix(0 112 -58 0 160 151)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity=".82" />
          <stop offset=".46" stopColor="#c5d2e8" stopOpacity=".5" />
          <stop offset="1" stopColor="#8999b2" stopOpacity=".04" />
        </radialGradient>
        <radialGradient id="vesper-core" cx="0" cy="0" r="1" gradientTransform="matrix(0 24 -24 0 160 151)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity=".96" />
          <stop offset="1" stopColor="#d7c6e4" stopOpacity=".08" />
        </radialGradient>
        <filter id="vesper-soft-glow" x="0" y="0" width="320" height="300" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1.7" />
        </filter>
      </defs>
      <g filter="url(#vesper-soft-glow)">
        {bloomPetals.map((index) => (
          <g key={index} transform={`translate(160 151) rotate(${index * 20})`}>
            <path
              d={index % 2 === 0
                ? 'M0 -7C-19 -22 -34 -60 -24 -91C-16 -116 2 -122 10 -96C20 -64 10 -27 0 -7Z'
                : 'M0 -7C-15 -22 -27 -52 -20 -77C-14 -99 1 -104 8 -82C16 -56 8 -25 0 -7Z'}
              fill="url(#vesper-petal)"
              stroke="#e7edf7"
              strokeOpacity=".28"
              strokeWidth="1"
            />
          </g>
        ))}
      </g>
      <circle cx="160" cy="151" r="17" fill="url(#vesper-core)" />
      <circle cx="160" cy="151" r="5" fill="#fff" fillOpacity=".82" />
    </svg>
    <span className="prism-orbit-petal prism-orbit-petal-one" />
    <span className="prism-orbit-petal prism-orbit-petal-two" />
    <span className="prism-orbit-petal prism-orbit-petal-three" />
  </div>
);

export const HeaderHero: React.FC = () => {
  return (
    <main className="hero" id="top">
      <FloatingBloom />
      <div className="hero-copy">
        {/* Badge */}
        <div className="badge appear appear--pop">
          <svg className="badge-star" width="18" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z" />
          </svg>
          <span>Adaptive AI Infrastructure</span>
        </div>

        {/* H1 */}
        <h1 className="hero-h1">
          <span className="headline-line appear appear--mask">
            Say what you need.
          </span>
          <span className="headline-line appear appear--mask" style={{ '--d': '0.62s' } as React.CSSProperties}>
            Get the workspace you need.
          </span>
        </h1>

        {/* Lede */}
        <p className="lede appear appear--soft" style={{ '--d': '0.82s', animationDuration: '1.25s' } as React.CSSProperties}>
          You adapt to every app. Prism makes the app adapt to you.
        </p>

        {/* Actions */}
        <div className="hero-actions">
          <a href="#workspace" className="btn btn-solid appear appear--btn" style={{ '--d': '0.96s' } as React.CSSProperties}>
            Start for Free
          </a>
          <a href="#demo" className="btn btn-ghost appear appear--side" style={{ '--d': '1.10s' } as React.CSSProperties}>
            See it in action <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </main>
  );
};