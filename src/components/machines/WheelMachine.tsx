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
  const activeParticipants = participants.filter(p => !p.muted && !p.hasWon);
  const totalTickets = activeParticipants.reduce((sum, p) => sum + p.tickets, 0);

  useEffect(() => {
    if (isSpinning) {
      const extraSpins = 5 + Math.random() * 5;
      const targetRotation = rotation + extraSpins * 360;
      setRotation(targetRotation);

      setTimeout(() => {
        const finalRotation = targetRotation % 360;
        const normalizedRotation = (360 - (finalRotation - 90)) % 360;
        
        let currentAngle = 0;
        const winner = activeParticipants.find(p => {
          const sliceAngle = (p.tickets / totalTickets) * 360;
          if (normalizedRotation >= currentAngle && normalizedRotation < currentAngle + sliceAngle) {
            return true;
          }
          currentAngle += sliceAngle;
          return false;
        });

        if (winner) onWinner(winner);
      }, 4000);
    }
  }, [isSpinning]);

  const colors = ['#FF007F', '#00FF00', '#FFFF00', '#00FFFF', '#FF00FF', '#FFA500'];

  let currentAngle = 0;

  return (
    <div className="relative w-full max-w-md aspect-square mx-auto">
      <div 
        className="w-full h-full rounded-full border-8 border-yellow-400 shadow-[0_0_30px_rgba(255,255,0,0.5)] overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {activeParticipants.map((p, i) => {
            const sliceAngle = (p.tickets / totalTickets) * 360;
            const x1 = 50 + 50 * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = 50 + 50 * Math.sin((currentAngle * Math.PI) / 180);
            const x2 = 50 + 50 * Math.cos(((currentAngle + sliceAngle) * Math.PI) / 180);
            const y2 = 50 + 50 * Math.sin(((currentAngle + sliceAngle) * Math.PI) / 180);
            
            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${sliceAngle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
            const color = colors[i % colors.length];
            const midAngle = currentAngle + sliceAngle / 2;
            
            currentAngle += sliceAngle;

            return (
              <g key={p.id}>
                <path d={pathData} fill={color} stroke="white" strokeWidth="0.5" />
                <text
                  x="75"
                  y="50"
                  fill="white"
                  fontSize="3"
                  fontWeight="bold"
                  transform={`rotate(${midAngle}, 50, 50)`}
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {p.name.slice(0, 10)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-12 bg-red-600 clip-path-triangle z-10 shadow-lg" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
    </div>
  );
};

export default WheelMachine;