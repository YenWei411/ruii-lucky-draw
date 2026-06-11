"use client";

import React, { useState, useEffect } from 'react';
import { Participant } from '@/types/lucky-draw';
import { pickSecureWinner } from '@/utils/fairness';

interface GachaMachineProps {
  participants: Participant[];
  onWinner: (participant: Participant) => void;
  isSpinning: boolean;
}

const GachaMachine = ({ participants, onWinner, isSpinning }: GachaMachineProps) => {
  const [isCranking, setIsCranking] = useState(false);
  const [capsule, setCapsule] = useState<any>(null);

  useEffect(() => {
    if (isSpinning) {
      setIsCranking(true);
      
      // PURE FAIR: Pre-calculate winner
      const activeParticipants = participants.filter(p => !p.muted && !p.hasWon && p.tickets > 0);
      const pool = activeParticipants.flatMap(p => Array(p.tickets).fill(p));
      const winner = pickSecureWinner(pool);

      setTimeout(() => {
        setIsCranking(false);
        if (winner) {
          setCapsule({
            participant: winner,
            color: ['#FF007F', '#00FF00', '#FFFF00', '#00FFFF', '#FF00FF'][Math.floor(Math.random() * 5)]
          });

          setTimeout(() => {
            onWinner(winner);
            setCapsule(null);
          }, 2000);
        }
      }, 1500);
    }
  }, [isSpinning]);

  return (
    <div className="relative w-full max-w-md aspect-[3/4] mx-auto bg-red-600 rounded-t-3xl border-x-8 border-t-8 border-red-800 shadow-2xl flex flex-col">
      <div className="flex-1 bg-blue-100/20 m-4 rounded-2xl border-4 border-red-800 relative overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="absolute w-8 h-8 rounded-full border-2 border-white/20"
            style={{ 
              backgroundColor: ['#FF007F', '#00FF00', '#FFFF00', '#00FFFF', '#FF00FF'][i % 5],
              left: `${(i * 25) % 80 + 10}%`, top: `${Math.floor(i / 3) * 20 + 10}%`, opacity: 0.6
            }}
          />
        ))}
      </div>
      <div className="h-40 bg-red-700 relative flex items-center justify-center">
        <div className={`w-20 h-20 rounded-full border-8 border-yellow-500 bg-yellow-400 flex items-center justify-center transition-transform duration-500 ${isCranking ? 'rotate-180' : ''}`}>
          <div className="w-2 h-12 bg-yellow-600 rounded-full" />
        </div>
        <div className="absolute bottom-4 w-24 h-12 bg-red-900 rounded-lg border-4 border-red-950 flex items-center justify-center">
          {capsule && <div className="w-8 h-8 rounded-full animate-bounce" style={{ backgroundColor: capsule.color }} />}
        </div>
      </div>
      {capsule && (
        <div className="absolute inset-0 flex items-center justify-center z-20 animate-in zoom-in duration-500">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border-8 border-yellow-400 text-center transform -rotate-3">
            <div className="text-sm text-gray-500 mb-2">GACHA REVEAL!</div>
            <div className="text-3xl font-bold text-red-600">{capsule.participant.name}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GachaMachine;