
import React from 'react';

interface CompassDiscProps {
  heading: number;
  isDarkMode: boolean;
}

const CompassDisc: React.FC<CompassDiscProps> = ({ heading, isDarkMode }) => {
  const strokeColor = isDarkMode ? '#e2e8f0' : '#1e293b';
  const accentColor = '#ef4444'; // Red-500
  const secondaryColor = isDarkMode ? '#52525b' : '#94a3b8';

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 flex items-center justify-center">
      {/* Outer Ring */}
      <div className={`absolute inset-0 rounded-full border-4 ${isDarkMode ? 'border-zinc-800' : 'border-gray-200'} shadow-2xl`}></div>
      
      {/* Disc */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full compass-transition"
        style={{ transform: `rotate(${-heading}deg)` }}
      >
        <circle cx="200" cy="200" r="190" fill="transparent" stroke={secondaryColor} strokeWidth="1" strokeDasharray="2,8" />
        
        {/* Ticks */}
        {[...Array(72)].map((_, i) => (
          <line
            key={i}
            x1="200"
            y1={i % 2 === 0 ? "20" : "30"}
            x2="200"
            y2="45"
            stroke={i % 9 === 0 ? strokeColor : secondaryColor}
            strokeWidth={i % 9 === 0 ? "3" : "1.5"}
            transform={`rotate(${i * 5}, 200, 200)`}
          />
        ))}

        {/* Cardinal Letters */}
        <text x="200" y="80" textAnchor="middle" fontSize="36" fontWeight="800" fill={accentColor} transform="rotate(0, 200, 200)">N</text>
        <text x="200" y="80" textAnchor="middle" fontSize="30" fontWeight="600" fill={strokeColor} transform="rotate(90, 200, 200)">E</text>
        <text x="200" y="80" textAnchor="middle" fontSize="30" fontWeight="600" fill={strokeColor} transform="rotate(180, 200, 200)">S</text>
        <text x="200" y="80" textAnchor="middle" fontSize="30" fontWeight="600" fill={strokeColor} transform="rotate(270, 200, 200)">W</text>

        {/* Degree Markers */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <text
            key={deg}
            x="200"
            y="115"
            textAnchor="middle"
            fontSize="12"
            fontWeight="400"
            fill={secondaryColor}
            transform={`rotate(${deg}, 200, 200)`}
          >
            {deg}°
          </text>
        ))}
      </svg>

      {/* Static Needle (Pointer) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="w-1 h-8 bg-red-500 rounded-full shadow-lg z-10"></div>
        <div className="w-4 h-4 -mt-2 bg-red-500 rotate-45 z-10"></div>
      </div>

      {/* Central Readout */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none`}>
        <span className={`text-4xl md:text-5xl font-extrabold mono ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
          {Math.round(heading)}°
        </span>
        <span className={`text-lg font-semibold uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {getCardinal(heading)}
        </span>
      </div>
    </div>
  );
};

const getCardinal = (angle: number): string => {
  const directions = ['North', 'NE', 'East', 'SE', 'South', 'SW', 'West', 'NW'];
  return directions[Math.round(angle / 45) % 8];
};

export default CompassDisc;
