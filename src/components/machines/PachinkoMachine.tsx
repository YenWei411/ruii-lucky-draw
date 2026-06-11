"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Participant } from '@/types/lucky-draw';
import { shuffleEntries, pickSecureWinner } from '@/utils/fairness';

interface PachinkoMachineProps {
  participants: Participant[];
  onWinner: (participant: Participant) => void;
  isSpinning: boolean;
}

const PachinkoMachine = ({ participants, onWinner, isSpinning }: PachinkoMachineProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shuffledEntries, setShuffledEntries] = useState<Participant[]>([]);
  
  useEffect(() => {
    const activeParticipants = participants.filter(p => !p.muted && !p.hasWon && p.tickets > 0);
    const entries = activeParticipants.flatMap(p => 
      Array.from({ length: p.tickets }).map(() => p)
    );
    setShuffledEntries(shuffleEntries(entries));
  }, [participants]);

  useEffect(() => {
    if (!isSpinning || shuffledEntries.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    let ball = { 
      x: (width * 0.3) + (Math.random() * width * 0.4), 
      y: 20, 
      vx: (Math.random() - 0.5) * 4, 
      vy: 2 
    };

    // Create a chaotic peg layout
    const pegs: { x: number, y: number }[] = [];
    const rows = 14;
    const cols = 12;
    const spacingX = width / (cols + 1);
    const spacingY = (height - 180) / rows;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Randomly skip some pegs to create "holes" and clusters
        if (Math.random() > 0.88) continue;

        // Add significant jitter to break the grid feel
        const jitterX = (Math.random() - 0.5) * spacingX * 0.9;
        const jitterY = (Math.random() - 0.5) * spacingY * 0.6;

        pegs.push({
          x: (col + 1 + (row % 2 ? 0.5 : 0)) * spacingX + jitterX,
          y: row * spacingY + 100 + jitterY
        });
      }
    }

    // Add some completely random stray pegs in the middle
    for (let i = 0; i < 15; i++) {
      pegs.push({
        x: 40 + Math.random() * (width - 80),
        y: 120 + Math.random() * (height - 250)
      });
    }

    const colors = ['#FF007F', '#7000FF', '#00FF00', '#FFFF00', '#00FFFF', '#FF00FF'];
    const slotWidth = width / shuffledEntries.length;

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Background
      const grad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw chaotic pegs
      pegs.forEach(p => {
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#fbbf24';
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw slots
      shuffledEntries.forEach((p, i) => {
        const x = i * slotWidth;
        ctx.fillStyle = colors[i % colors.length];
        ctx.globalAlpha = 0.25;
        ctx.fillRect(x, height - 60, slotWidth, 60);
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeRect(x, height - 60, slotWidth, 60);
      });

      // Physics
      ball.vy += 0.28; // gravity
      ball.vx *= 0.992; // friction
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x < 10 || ball.x > width - 10) {
        ball.vx *= -0.7;
        ball.x = ball.x < 10 ? 10 : width - 10;
      }

      pegs.forEach(p => {
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = 9; 

        if (dist < minDist) {
          const angle = Math.atan2(dy, dx);
          const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          ball.vx = Math.cos(angle) * speed * 0.75 + (Math.random() - 0.5) * 1.5;
          ball.vy = Math.sin(angle) * speed * 0.75;
          ball.x = p.x + Math.cos(angle) * minDist;
          ball.y = p.y + Math.sin(angle) * minDist;
        }
      });

      // Draw Ball
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ec4899';
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (ball.y < height - 30) {
        frame = requestAnimationFrame(animate);
      } else {
        const winnerIndex = Math.floor(ball.x / slotWidth);
        const winner = shuffledEntries[Math.min(winnerIndex, shuffledEntries.length - 1)];
        if (winner) onWinner(winner);
      }
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, [isSpinning, shuffledEntries]);

  return (
    <div className="w-full max-w-md aspect-[3/4] mx-auto bg-slate-900 rounded-2xl border-8 border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden relative">
      <canvas ref={canvasRef} width={400} height={533} className="w-full h-full" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 to-transparent opacity-10" />
      {shuffledEntries.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-bold uppercase tracking-widest">
          No Active Entries
        </div>
      )}
    </div>
  );
};

export default PachinkoMachine;