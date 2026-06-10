"use client";

import React, { useState, useEffect } from 'react';
import { Participant } from '@/types/lucky-draw';

interface BallMachineProps {
  participants: Participant[];
  onWinner: (participant: Participant) => void;
  isSpinning: boolean;
}

const BallMachine = ({ participants, onWinner, isSpinning }: BallMachineProps) => {
  const [balls, setBalls] = useState<any[]>([]);
  const [winningBall, setWinningBall] = useState<any>(null);

  useEffect(() => {
    const activeParticipants = participants.filter(p => !p.muted && !p.hasWon);
    const newBalls = activeParticipants.flatMap(p => 
      Array.from({ length: p.tickets }).map((_, i) => ({
        id: `${p.id}-${i}`,
        participant: p,
        color: ['#FF007F', '#00FF00', '#FFFF00', '#00FFFF', '#FF00FF'][Math.floor(Math.random() * 5)],
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4
      }))
    );
    setBalls(newBalls);
  }, [participants]);

  useEffect(() => {
    if (isSpinning) {
      setWinningBall(null);
      let frame: number;
      const start = Date.now();
      
      const animate = () => {
        setBalls(prev => prev.map(b => {
          let nx = b.x + b.vx * (isSpinning ? 3 : 1);
          let ny = b.y + b.vy * (isSpinning ? 3 : 1);
          let nvx = b.vx;
          let nvy = b.vy;

          if (nx < 5 || nx > 95) nvx *= -1;
          if (ny < 5 || ny > 95) nvy *= -1;

          return { ...b, x: nx, y: ny, vx: nvx, vy: nvy };
        }));

        if (Date.now() - start < 3000) {
          frame = requestAnimationFrame(animate);
        } else {
          const winner = balls[Math.floor(Math.random() * balls.length)];
          setWinningBall(winner);
          setTimeout(() => onWinner(winner.participant), 1000);
        }
      };

      frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
    }
  }, [isSpinning]);

  return (
    <div className="relative w-full max-w-md aspect-square mx-auto bg-slate-900 rounded-full border-8 border-slate-700 overflow-hidden shadow-2xl">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="ballGrad">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="black" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        {balls.map(b => (
          <g key={b.id} transform={`translate(${b.x}, ${b.y})`}>
            <circle r="4" fill={b.color} />
            <circle r="4" fill="url(#ballGrad)" />
            <text fontSize="2" fill="white" textAnchor="middle" dy=".3em">{b.participant.name[0]}</text>
          </g>
        ))}
      </svg>
      
      {winningBall && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 animate-in zoom-in duration-500">
          <div 
            className="w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-[0_0_50px_white]"
            style={{ backgroundColor: winningBall.color }}
          >
            {winningBall.participant.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default BallMachine;