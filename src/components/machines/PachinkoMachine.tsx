"use client";

import React, { useEffect, useRef } from 'react';
import { Participant } from '@/types/lucky-draw';

interface PachinkoMachineProps {
  participants: Participant[];
  onWinner: (participant: Participant) => void;
  isSpinning: boolean;
}

const PachinkoMachine = ({ participants, onWinner, isSpinning }: PachinkoMachineProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeParticipants = participants.filter(p => !p.muted && !p.hasWon);
  const totalTickets = activeParticipants.reduce((sum, p) => sum + p.tickets, 0);

  useEffect(() => {
    if (!isSpinning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    let ball = { x: width / 2, y: 20, vx: (Math.random() - 0.5) * 4, vy: 2 };
    const pegs: { x: number, y: number }[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 10; col++) {
        pegs.push({
          x: (col + (row % 2 ? 0.5 : 0)) * (width / 10) + 20,
          y: row * 50 + 100
        });
      }
    }

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw pegs
      ctx.fillStyle = '#fbbf24';
      pegs.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw slots
      let currentX = 0;
      activeParticipants.forEach((p, i) => {
        const slotWidth = (p.tickets / totalTickets) * width;
        ctx.fillStyle = i % 2 ? '#1e293b' : '#334155';
        ctx.fillRect(currentX, height - 60, slotWidth, 60);
        ctx.fillStyle = 'white';
        ctx.font = '10px sans-serif';
        ctx.fillText(p.name.slice(0, 5), currentX + 5, height - 20);
        currentX += slotWidth;
      });

      // Update ball
      ball.vy += 0.2; // gravity
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x < 5 || ball.x > width - 5) ball.vx *= -0.8;

      pegs.forEach(p => {
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 12) {
          const angle = Math.atan2(dy, dx);
          ball.vx = Math.cos(angle) * 5 + (Math.random() - 0.5);
          ball.vy = Math.sin(angle) * 5;
        }
      });

      // Draw ball
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
      ctx.fill();

      if (ball.y < height - 60) {
        frame = requestAnimationFrame(animate);
      } else {
        let checkX = 0;
        const winner = activeParticipants.find(p => {
          const slotWidth = (p.tickets / totalTickets) * width;
          if (ball.x >= checkX && ball.x < checkX + slotWidth) return true;
          checkX += slotWidth;
          return false;
        });
        if (winner) onWinner(winner);
      }
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, [isSpinning]);

  return (
    <div className="w-full max-w-md aspect-[3/4] mx-auto bg-slate-800 rounded-xl border-8 border-slate-900 shadow-2xl overflow-hidden">
      <canvas ref={canvasRef} width={400} height={533} className="w-full h-full" />
    </div>
  );
};

export default PachinkoMachine;