"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Participant } from '@/types/lucky-draw';
import { shuffleEntries } from '@/utils/fairness';

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
    
    // Start ball at a random top position within the center area
    let ball = { 
      x: (width * 0.4) + (Math.random() * width * 0.2), 
      y: 20, 
      vx: (Math.random() - 0.5) * 3, 
      vy: 2 
    };

    // Create a denser structured staggered grid
    const pegs: { x: number, y: number }[] = [];
    const rows = 16; // Increased from 10
    const cols = 18; // Increased from 11
    const spacingX = width / (cols + 1);
    const spacingY = (height - 180) / rows;

    for (let row = 0; row < rows; row++) {
      const isOffset = row % 2 === 1;
      const rowCols = isOffset ? cols - 1 : cols;
      const rowWidth = rowCols * spacingX;
      const startX = (width - rowWidth + spacingX) / 2;

      for (let col = 0; col < rowCols; col++) {
        pegs.push({
          x: startX + col * spacingX,
          y: row * spacingY + 100
        });
      }
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

      // Draw structured pegs
      pegs.forEach(p => {
        ctx.shadowBlur = 3;
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
        ctx.globalAlpha = 0.2;
        ctx.fillRect(x, height - 60, slotWidth, 60);
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.strokeRect(x, height - 60, slotWidth, 60);
      });

      // Physics
      ball.vy += 0.25; // gravity
      ball.vx *= 0.99; // friction
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall bounce
      if (ball.x < 10 || ball.x > width - 10) {
        ball.vx *= -0.6;
        ball.x = ball.x < 10 ? 10 : width - 10;
      }

      // Peg collisions
      pegs.forEach(p => {
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = 8.5; // ball radius + peg radius + buffer

        if (dist < minDist) {
          const angle = Math.atan2(dy, dx);
          const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          // Add a tiny bit of randomness to the bounce to prevent infinite loops
          const jitter = (Math.random() - 0.5) * 0.4;
          ball.vx = Math.cos(angle + jitter) * speed * 0.75;
          ball.vy = Math.sin(angle + jitter) * speed * 0.75;
          ball.x = p.x + Math.cos(angle) * minDist;
          ball.y = p.y + Math.sin(angle) * minDist;
        }
      });

      // Draw Ball
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ec4899';
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2);
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