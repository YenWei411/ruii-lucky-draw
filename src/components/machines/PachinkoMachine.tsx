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
  
  // Prepare the board whenever participants change
  useEffect(() => {
    const activeParticipants = participants.filter(p => !p.muted && !p.hasWon && p.tickets > 0);
    const entries = activeParticipants.flatMap(p => 
      Array.from({ length: p.tickets }).map(() => p)
    );
    // Shuffle entries so they are distributed evenly across the bottom slots
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
    
    // Start ball at a random top position
    let ball = { 
      x: (width * 0.2) + (Math.random() * width * 0.6), 
      y: 20, 
      vx: (Math.random() - 0.5) * 2, 
      vy: 2 
    };

    // Create a denser peg grid (12 rows, 14 columns)
    const pegs: { x: number, y: number }[] = [];
    const rows = 12;
    const cols = 14;
    const spacingX = width / (cols + 1);
    const spacingY = (height - 150) / rows;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        pegs.push({
          x: (col + 1 + (row % 2 ? 0.5 : 0)) * spacingX - (row % 2 ? spacingX / 2 : 0),
          y: row * spacingY + 80
        });
      }
    }

    const colors = ['#FF007F', '#7000FF', '#00FF00', '#FFFF00', '#00FFFF', '#FF00FF'];
    const slotWidth = width / shuffledEntries.length;

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Background Glow
      const grad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw Pegs with neon glow
      pegs.forEach(p => {
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#fbbf24';
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Shuffled Slots
      shuffledEntries.forEach((p, i) => {
        const x = i * slotWidth;
        ctx.fillStyle = colors[i % colors.length];
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x, height - 60, slotWidth, 60);
        ctx.globalAlpha = 1.0;
        
        // Draw divider
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.moveTo(x, height - 60);
        ctx.lineTo(x, height);
        ctx.stroke();
      });

      // Update ball physics
      ball.vy += 0.25; // gravity
      ball.vx *= 0.99; // air resistance
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall collisions
      if (ball.x < 8 || ball.x > width - 8) {
        ball.vx *= -0.6;
        ball.x = ball.x < 8 ? 8 : width - 8;
      }

      // Peg collisions
      pegs.forEach(p => {
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = 10; // ball radius (6) + peg radius (3) + buffer

        if (dist < minDist) {
          const angle = Math.atan2(dy, dx);
          const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          
          // Reflect ball
          ball.vx = Math.cos(angle) * speed * 0.8 + (Math.random() - 0.5);
          ball.vy = Math.sin(angle) * speed * 0.8;
          
          // Push ball out of peg
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
        // Determine winner based on landing X position
        const winnerIndex = Math.floor(ball.x / slotWidth);
        const winner = shuffledEntries[Math.min(winnerIndex, shuffledEntries.length - 1)];
        if (winner) onWinner(winner);
      }
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, [isSpinning, shuffledEntries]);

  return (
    <div className="w-full max-w-md aspect-[3/4] mx-auto bg-slate-900 rounded-2xl border-8 border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden relative">
      <canvas ref={canvasRef} width={400} height={533} className="w-full h-full" />
      
      {/* Glass Overlay Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent opacity-20" />
      
      {shuffledEntries.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-bold">
          NO ENTRIES
        </div>
      )}
    </div>
  );
};

export default PachinkoMachine;