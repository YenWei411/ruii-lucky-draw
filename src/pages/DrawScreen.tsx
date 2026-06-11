"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLuckyDraw } from '@/hooks/use-lucky-draw';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Volume2, VolumeX, Download, Play, X, Check } from 'lucide-react';
import { useAudio } from '@/hooks/use-audio';
import Confetti from '@/components/Confetti';
import WheelMachine from '@/components/machines/WheelMachine';
import BallMachine from '@/components/machines/BallMachine';
import GachaMachine from '@/components/machines/GachaMachine';
import PachinkoMachine from '@/components/machines/PachinkoMachine';
import { Participant, Winner } from '@/types/lucky-draw';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const DrawScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessions, updateSession } = useLuckyDraw();
  const { init, playSound, toggleMute } = useAudio();
  
  const session = sessions.find(s => s.id === id);

  const [isSpinning, setIsSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingWinner, setPendingWinner] = useState<Participant | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (session) init();
  }, [session, init]);

  const handleWinner = useCallback((winner: Participant) => {
    setIsSpinning(false);
    setPendingWinner(winner);
    playSound('ding');
  }, [playSound]);

  const handleAcceptPrize = () => {
    if (!session || !pendingWinner) return;

    setShowConfetti(true);
    playSound('win');

    const newWinner: Winner = {
      participantId: pendingWinner.id,
      name: pendingWinner.name,
      prizeNumber: session.winners.length + 1,
      drawnAt: Date.now(),
      machineType: session.machineType
    };

    const updatedParticipants = session.participants.map(p => {
      if (p.id === pendingWinner.id) {
        // Remove all entries and mark as won
        return { ...p, hasWon: true, tickets: 0 };
      }
      return p;
    });

    updateSession({
      ...session,
      winners: [...session.winners, newWinner],
      participants: updatedParticipants
    });

    setPendingWinner(null);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const handleRejectPrize = () => {
    if (!session || !pendingWinner) return;

    playSound('pop');

    const updatedParticipants = session.participants.map(p => {
      if (p.id === pendingWinner.id) {
        // Remove only the single entry that was drawn
        return { ...p, tickets: Math.max(0, p.tickets - 1) };
      }
      return p;
    });

    updateSession({
      ...session,
      participants: updatedParticipants
    });

    setPendingWinner(null);
  };

  if (!session) return <div className="min-h-screen bg-[#0f172a] text-white p-8 flex items-center justify-center">Session not found</div>;

  const activeParticipants = session.participants.filter(p => !p.muted && !p.hasWon && p.tickets > 0);
  const winners = session.winners;
  const remainingPrizes = session.prizeCount - winners.length;

  const handleDrawClick = () => {
    if (remainingPrizes <= 0 || activeParticipants.length === 0) {
      playSound('error');
      return;
    }
    setShowConfirm(true);
  };

  const startDraw = () => {
    setShowConfirm(false);
    setIsSpinning(true);
    playSound('pop');
  };

  const exportCSV = () => {
    const headers = "Prize #,Winner Name,Drawn At\n";
    const rows = session.winners.map(w => 
      `${w.prizeNumber},${w.name},${new Date(w.drawnAt).toLocaleString()}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `winners_${session.name}.csv`;
    a.click();
  };

  const renderMachine = () => {
    const props = { participants: session.participants, onWinner: handleWinner, isSpinning };
    switch (session.machineType) {
      case 'wheel': return <WheelMachine {...props} />;
      case 'ball': return <BallMachine {...props} />;
      case 'gacha': return <GachaMachine {...props} />;
      case 'pachinko': return <PachinkoMachine {...props} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 font-['Nunito'] overflow-hidden flex flex-col">
      <Confetti active={showConfetti} />
      
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-400">
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl font-['Lilita_One'] text-yellow-400">{session.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-800 px-4 py-2 rounded-full border border-slate-700 text-pink-400 font-bold">
            {remainingPrizes} PRIZES LEFT
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMuted(toggleMute())}
            className="text-slate-400"
          >
            {muted ? <VolumeX /> : <Volume2 />}
          </Button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Participants */}
        <div className="bg-slate-800/50 rounded-3xl border border-slate-700 p-4 flex flex-col">
          <h2 className="font-bold text-slate-400 mb-4 px-2">PARTICIPANTS</h2>
          <div className="flex-1 overflow-auto space-y-2 pr-2">
            {session.participants.map(p => (
              <div 
                key={p.id} 
                className={`p-3 rounded-xl flex justify-between items-center transition-all ${p.hasWon ? 'bg-slate-700/50 opacity-50' : p.muted ? 'opacity-30' : 'bg-slate-700'}`}
              >
                <span className="font-medium truncate">{p.name}</span>
                <div className="flex items-center gap-2">
                  {p.hasWon && <Trophy size={14} className="text-yellow-500" />}
                  <span className="text-xs bg-slate-900 px-2 py-1 rounded-md">{p.tickets}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel: Machine */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center gap-8">
          <div className="w-full flex-1 flex items-center justify-center">
            {renderMachine()}
          </div>
          
          <Button 
            onClick={handleDrawClick}
            disabled={isSpinning || remainingPrizes <= 0 || !!pendingWinner}
            className={`w-64 h-20 text-2xl font-bold rounded-full shadow-2xl transition-all transform active:scale-95 ${isSpinning ? 'bg-slate-700' : 'bg-pink-600 hover:bg-pink-500 animate-pulse'}`}
          >
            {isSpinning ? 'SPINNING...' : 'DRAW!'}
          </Button>
        </div>

        {/* Right Panel: Winners */}
        <div className="bg-slate-800/50 rounded-3xl border border-slate-700 p-4 flex flex-col">
          <h2 className="font-bold text-yellow-400 mb-4 px-2 flex items-center gap-2">
            <Trophy size={18} /> WINNERS
          </h2>
          <div className="flex-1 overflow-auto space-y-3 pr-2">
            {session.winners.map((w, i) => (
              <div 
                key={i} 
                className="bg-gradient-to-r from-yellow-500/20 to-transparent p-4 rounded-2xl border border-yellow-500/30 animate-in slide-in-from-right duration-500"
              >
                <div className="text-xs text-yellow-500 font-bold">PRIZE #{w.prizeNumber}</div>
                <div className="text-lg font-bold">{w.name}</div>
                <div className="text-[10px] text-slate-500">{new Date(w.drawnAt).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
          <Button 
            onClick={exportCSV}
            variant="outline" 
            className="mt-4 border-slate-700 text-slate-400 hover:text-white"
          >
            <Download className="mr-2" size={16} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Draw Confirmation */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-['Lilita_One'] text-yellow-400">Ready to Draw?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Drawing Prize #{winners.length + 1}. Are you ready to find the next winner?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={startDraw} className="bg-pink-600 hover:bg-pink-700">
              <Play className="mr-2" size={16} /> Let's Go!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Prize Acceptance Confirmation */}
      <AlertDialog open={!!pendingWinner} onOpenChange={(open) => !open && setPendingWinner(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-['Lilita_One'] text-pink-400 text-center">
              WINNER REVEALED!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-4">
              <div className="text-5xl font-bold text-white py-4">{pendingWinner?.name}</div>
              <div className="text-slate-400 text-lg">Does this participant want the prize?</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center gap-4 sm:justify-center">
            <Button 
              onClick={handleRejectPrize}
              variant="outline"
              className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10 h-16 text-xl font-bold"
            >
              <X className="mr-2" /> NO (Remove 1 Entry)
            </Button>
            <Button 
              onClick={handleAcceptPrize}
              className="flex-1 bg-green-600 hover:bg-green-700 h-16 text-xl font-bold"
            >
              <Check className="mr-2" /> YES (Award Prize)
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DrawScreen;