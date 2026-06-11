"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Participant } from '@/types/lucky-draw';
import { pickSecureWinner } from '@/utils/fairness';

interface WheelMachineProps {
  participants: Participant[];
  onWinner: (participant: Participant) => void;
  isSpinning: boolean;
}

const WheelMachine = ({ participants, onWinner, isSpinning }: WheelMachineProps) => {
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const winnerRef = useRef<Participant | null>(null);
  
  const activeParticipants = participants.filter(p => !p.muted && !p.hasWon && p.tickets > 0);
  const entries = activeParticipants.flatMap(p => 
    Array.from({ length: p.tickets }).map(() => p)
  );

  useEffect(() => {
    if (isSpinning && entries.length > 0) {
      setIsAnimating(true);
      
      // 1. PURE FAIR: Pick the winner BEFORE animating
      const winner = pickSecureWinner(entries);
      winnerRef.current = winner;

      if (winner) {
        // 2. Calculate exactly where to land
        // Find all indices where this winner appears
        const winnerIndices = entries.reduce((acc: number[], p, i) => {
          if (p.id === winner.id) acc.push(i);
          return acc;
        }, []);
        
        // Pick a random instance of this winner's tickets to land on
        const targetTicketIndex = winnerIndices[Math.floor(Math.random() * winnerIndices.length)];
        
        const sliceAngle = 360 / entries.length;
        const targetSliceCenter = (targetTicketIndex * sliceAngle) + (sliceAngle / 2);
        
        // The wheel rotates clockwise. To put the target at the top (90deg relative to SVG 0),
        // we need to rotate the wheel by: (360 - targetSliceCenter + 90)
        const extraSpins = 8 + Math.random() * 4;
        const landingRotation = (360 - targetSliceCenter + 90) % 360;
        const totalRotation = rotation + (extraSpins * 360) + (landingRotation - (rotation % 360));
        
        setRotation(totalRotation);

        setTimeout(() => {
          setIsAnimating(false);
          onWinner(winner);
        }, 4000);
      }
    }
  }, [isSpinning]);

  const colors = ['#FF007F', '#7000FF', '#00FF00', '#FFFF00', '#00FFFF', '#FF00FF', '#FF5E00', '#007BFF'];

  if (entries.length === 0) return <div className="text-slate-500">No active entries</div>;

  const sliceAngle = 360 / entries.length;

  return (
    <div className="relative w-full max-w-lg aspect-square mx-auto p-4">
      <div className="absolute inset-0 rounded-full border-[12px] border-slate-800 shadow-[0_0_50px_rgba(255,0,127,0.3)] z-0">
        {Array.from({ length: 24 }).map((_, i) => (
          <div 
            key={i}
            className={`absolute w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15] transition-opacity duration-500 ${isAnimating ? 'animate-pulse' : ''}`}
            style={{ 
              left: '50%', top: '50%',
              transform: `rotate(${i * 15}deg) translateY(-185px) translateX(-50%)`,
              opacity: isAnimating ? (i % 2 === 0 ? 1 : 0.5) : 1
            }}
          />
        ))}
      </div>

      <div 
        className="relative w-full h-full rounded-full border-4 border-slate-700 shadow-2xl overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {entries.map((p, i) => {
            const startAngle = i * sliceAngle;
            const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 50 * Math.cos(((startAngle + sliceAngle) * Math.PI) / 180);
            const y2 = 50 + 50 * Math.sin(((startAngle + sliceAngle) * Math.PI) / 180);
            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${sliceAngle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
            return (
              <g key={`${p.id}-${i}`}>
                <path d={pathData} fill={colors[i % colors.length]} stroke="rgba(255,255,255,0.1)" strokeWidth="0.2" />
                {entries.length <= 40 && (
                  <text x="82" y="50" fill="white" fontSize={entries.length > 20 ? "1.5" : "2.5"} fontWeight="800"
                    transform={`rotate(${startAngle + sliceAngle / 2}, 50, 50)`} textAnchor="end" className="pointer-events-none drop-shadow-md"
                    style={{ fontFamily: 'Lilita One, sans-serif' }}>
                    {p.name.toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-yellow-400 shadow-xl flex items-center justify-center z-20">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 animate-spin-slow" />
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-30">
        <div className={`w-10 h-14 bg-white clip-path-triangle shadow-2xl transition-transform duration-75 ${isAnimating ? 'animate-bounce' : ''}`}
          style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
      </div>
    </div>
  );
};

export default WheelMachine;