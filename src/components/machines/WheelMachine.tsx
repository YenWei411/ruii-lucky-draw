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
  const activeParticipants = participants.filter(p => !p.muted && !p.hasWon && p.tickets > 0);
  
  // Flatten participants into individual entries (one per ticket)
  const entries = activeParticipants.flatMap(p => 
    Array.from({ length: p.tickets }).map(() => p)
  );

  useEffect(() => {
    if (isSpinning && entries.length > 0) {
      const extraSpins = 5 + Math.random() * 5;
      const targetRotation = rotation + extraSpins * 360;
      setRotation(targetRotation);

      setTimeout(() => {
        const finalRotation = targetRotation % 360;
        // Pointer is at the top (90 degrees)
        const normalizedRotation = (360 - (finalRotation - 90)) % 360;
        
        const sliceAngle = 360 / entries.length;
        const winnerIndex = Math.floor(normalizedRotation / sliceAngle);
        const winner = entries[winnerIndex % entries.length];

        if (winner) onWinner(winner);
      }, 4000);
    }
  }, [isSpinning]);

  const colors = ['#FF007F', '#00FF00', '#FFFF00', '#00FFFF', '#FF00FF', '#FFA500'];

  if (entries.length === 0) return <div className="text-slate-500">No entries available</div>;

  const sliceAngle = 360 / entries.length;

  return (
    <div className="relative w-full max-w-md aspect-square mx-auto">
      <div 
        className="w-full h-full rounded-full border-8 border-yellow-400 shadow-[0_0_30px_rgba(255,255,0,0.5)] overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
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
            const color = colors[i % colors.length];
            const midAngle = startAngle + sliceAngle / 2;

            return (
              <g key={`${p.id}-${i}`}>
                <path d={pathData} fill={color} stroke="white" strokeWidth="0.1" />
                {entries.length < 50 && (
                  <text
                    x="75"
                    y="50"
                    fill="white"
                    fontSize="2"
                    fontWeight="bold"
                    transform={`rotate(${midAngle}, 50, 50)`}
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {p.name.slice(0, 8)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-12 bg-red-600 clip-path-triangle z-10 shadow-lg" />
    </div>
  );
};

export default WheelMachine;