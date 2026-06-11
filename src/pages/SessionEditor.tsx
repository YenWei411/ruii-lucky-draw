"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLuckyDraw } from '@/hooks/use-lucky-draw';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Trash2, Volume2, VolumeX, Save } from 'lucide-react';
import { useAudio } from '@/hooks/use-audio';
import { MachineType, Participant } from '@/types/lucky-draw';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SessionEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessions, updateSession } = useLuckyDraw();
  const { init, playSound } = useAudio();
  
  const session = sessions.find(s => s.id === id);

  const [name, setName] = useState('');
  const [tickets, setTickets] = useState(1);
  const [bulkInput, setBulkInput] = useState('');

  useEffect(() => {
    if (session) {
      init();
    }
  }, [session, init]);

  if (!session) return <div className="min-h-screen bg-[#0f172a] text-white p-8 flex items-center justify-center">Session not found</div>;

  const handleAddParticipant = () => {
    if (!name) return;
    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name,
      tickets,
      muted: false,
      hasWon: false
    };
    updateSession({
      ...session,
      participants: [...session.participants, newParticipant]
    });
    setName('');
    setTickets(1);
    playSound('ding');
  };

  const handleBulkAdd = () => {
    const names = bulkInput.split('\n').filter(n => n.trim());
    const newParticipants = names.map(n => ({
      id: crypto.randomUUID(),
      name: n.trim(),
      tickets: 1,
      muted: false,
      hasWon: false
    }));
    updateSession({
      ...session,
      participants: [...session.participants, ...newParticipants]
    });
    setBulkInput('');
    playSound('ding');
  };

  const toggleMute = (pId: string) => {
    updateSession({
      ...session,
      participants: session.participants.map(p => p.id === pId ? { ...p, muted: !p.muted } : p)
    });
    playSound('pop');
  };

  const deleteParticipant = (pId: string) => {
    updateSession({
      ...session,
      participants: session.participants.filter(p => p.id !== pId)
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 font-['Nunito']">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center gap-4 mb-12">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-400">
            <ArrowLeft />
          </Button>
          <h1 className="text-4xl font-['Lilita_One'] text-yellow-400">Setup: {session.name}</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
              <h2 className="text-xl font-bold text-pink-400">Add Participant</h2>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-900 border-slate-700"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddParticipant()}
                />
              </div>
              <div className="space-y-2">
                <Label>Tickets</Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={tickets} 
                  onChange={(e) => setTickets(parseInt(e.target.value))}
                  className="bg-slate-900 border-slate-700"
                />
              </div>
              <Button onClick={handleAddParticipant} className="w-full bg-pink-600 hover:bg-pink-700">
                <Plus className="mr-2" /> Add
              </Button>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
              <h2 className="text-xl font-bold text-blue-400">Bulk Add (One per line)</h2>
              <textarea 
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm"
                placeholder="Alice&#10;Bob&#10;Charlie"
              />
              <Button onClick={handleBulkAdd} variant="secondary" className="w-full">
                Bulk Add
              </Button>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
              <h2 className="text-xl font-bold text-yellow-400">Machine Settings</h2>
              <div className="space-y-2">
                <Label>Machine Type</Label>
                <Select 
                  value={session.machineType} 
                  onValueChange={(v: MachineType) => updateSession({ ...session, machineType: v })}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wheel">Spinning Wheel 🎡</SelectItem>
                    <SelectItem value="ball">Ball Machine 🎱</SelectItem>
                    <SelectItem value="gacha">Gacha Capsule 🎪</SelectItem>
                    <SelectItem value="pachinko">Pachinko Board ⛓️</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Total Prizes</Label>
                <Input 
                  type="number" 
                  value={session.prizeCount} 
                  onChange={(e) => updateSession({ ...session, prizeCount: parseInt(e.target.value) })}
                  className="bg-slate-900 border-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="p-4 bg-slate-700/50 flex justify-between items-center">
                <h2 className="font-bold">Participants ({session.participants.length})</h2>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => updateSession({ ...session, participants: session.participants.map(p => ({ ...p, muted: true })) })}
                  >
                    Mute All
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => updateSession({ ...session, participants: session.participants.map(p => ({ ...p, muted: false })) })}
                  >
                    Unmute All
                  </Button>
                </div>
              </div>
              <div className="max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead>Name</TableHead>
                      <TableHead>Tickets</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {session.participants.map(p => (
                      <TableRow key={p.id} className={`border-slate-700 ${p.muted ? 'opacity-40 line-through' : ''}`}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.tickets}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => toggleMute(p.id)}
                            className={p.muted ? 'text-slate-500' : 'text-yellow-500'}
                          >
                            {p.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => deleteParticipant(p.id)}
                            className="text-red-500"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button 
                onClick={() => navigate(`/draw/${session.id}`)}
                className="bg-green-600 hover:bg-green-700 py-6 px-12 text-xl font-bold rounded-2xl shadow-[0_6px_0_#166534]"
              >
                <Save className="mr-2" /> SAVE & GO TO DRAW
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionEditor;