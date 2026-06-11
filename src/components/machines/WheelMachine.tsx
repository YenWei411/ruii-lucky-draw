"use client";

import React, { useState, useEffect } from 'react';
import { Participant } from '@/types/lucky-draw';

interface WheelMachineProps {
  participants: Participant[];
  onWinner: (participant: Participant) => void;
  isSpinning: boolean;
}

const WheelMachine = ({ participants, onWinner, isSpinning }: WheelMachineProps) => {
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const activeParticipants = participants.filter(p => !p.muted && !p.hasWon && p.tickets > 0);
  
  // Flatten participants into individual entries (one per ticket)
  const entries = activeParticipants.flatMap(p => 
    Array.from({ length: p.tickets }).map(() => p)
  );

  useEffect(() => {
    if (isSpinning && entries.length > 0) {
      setIsAnimating(true);
      // Dramatic spin: 8 to 12 full rotations plus a random offset
      const extraSpins = 8 + Math.random() * 4;
      const targetRotation = rotation + extraSpins * 360;
      setRotation(targetRotation);

      // Match the CSS transition duration (4000ms)
      const timer = setTimeout(() => {
        setIsAnimating(false);
        const finalRotation = targetRotation % 360;
        // Pointer is at the top (90 degrees)
        // We need to find which slice is at the top. 
        // The wheel rotates clockwise, so the "top" slice is at (360 - (rotation - 90)) % 360
        const normalizedRotation = (360 - (finalRotation - 90)) % 360;
        
        const sliceAngle = 360 / entries.length;
        const winnerIndex = Math.floor(normalizedRotation / sliceAngle);
        const winner = entries[winnerIndex % entries.length];

        if (winner) onWinner(winner);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isSpinning]);

  const colors = [
    '#FF007F', '#7000FF', '#00FF00', '#FFFF00', 
    '#00FFFF', '#FF00FF', '#FF5E00', '#007BFF'
  ];

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-500 gap-4">
        <div className="w-64 h-64 rounded-full border-4 border-dashed border-slate-700 flex items-center justify-center">
          <span className="text-center px-8">No active participants with tickets</span>
        </div>
      </div>
    );
  }

  const sliceAngle = 360 / entries.length;

  return (
    <div className="relative w-full max-w-lg aspect-square mx-auto p-4">
      {/* Outer Glowing Ring with Lights */}
      <div className="absolute inset-0 rounded-full border-[12px] border-slate-800 shadow-[0_0_50px_rgba(255,0,127,0.3)] z-0">
        {Array.from({ length: 24 }).map((_, i) => (
          <div 
            key={i}
            className={`absolute w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15] transition-opacity duration-500 ${isAnimating ? 'animate-pulse' : ''}`}
            style={{ 
              left: '50%',
              top: '50%',
              transform: `rotate(${i * 15}deg) translateY(-185px) translateX(-50%)`,
              opacity: isAnimating ? (i % 2 === 0 ? 1 : 0.5) : 1
            }}
          />
        ))}
      </div>

      {/* The Wheel */}
      <div 
        className="relative w-full h-full rounded-full border-4 border-slate-700 shadow-2xl overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <radialGradient id="wheelOverlay">
              <stop offset="70%" stopColor="black" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="0.3" />
            </radialGradient>
          </defs>
          
          {entries.map((p, i) => {
            const startAngle = i * sliceAngle;
            const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 50 * Math.cos(((startAngle + sliceAngle) * Math.PI) / 180);
            const y2 = 50 + 50 * Math.sin(((startAngle + sliceAngle) * Math.PI) / 180);
            
            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${sliceAngle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
            const color = colors[i % colors.length];
            const midAngle = startAngle + sliceAngle / 2;

            return (
              <g key={`${p.id}-${i}`}>
                <path d={pathData} fill={color} stroke="rgba(255,255,255,0.1)" strokeWidth="0.2" />
                {entries.length <= 40 && (
                  <text
                    x="82"
                    y="50"
                    fill="white"
                    fontSize={entries.length > 20 ? "1.5" : "2.5"}
                    fontWeight="800"
                    transform={`rotate(${midAngle}, 50, 50)`}
                    textAnchor="end"
                    className="pointer-events-none drop-shadow-md"
                    style={{ fontFamily: 'Lilita One, sans-serif' }}
                  >
                    {p.name.toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}
          <circle cx="50" cy="50" r="50" fill="url(#wheelOverlay)" />
        </svg>

        {/* Center Hub */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-yellow-400 shadow-xl flex items-center justify-center z-20">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 animate-spin-slow" />
          </div>
        </div>
      </div>

      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-30">
        <div 
          className={`w-10 h-14 bg-white clip-path-triangle shadow-2xl transition-transform duration-75 ${isAnimating ? 'animate-bounce' : ''}`}
          style={{ 
            clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 border-2 border-white -translate-y-1" />
      </div>
    </div>
  );
};

export default WheelMachine;