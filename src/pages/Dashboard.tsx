"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLuckyDraw } from '@/hooks/use-lucky-draw';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Plus, Trash2, Play, Calendar, Users, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MachineType } from '@/types/lucky-draw';

const Dashboard = () => {
  const { sessions, createSession, deleteSession } = useLuckyDraw();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrizes, setNewPrizes] = useState(1);
  const [newMachine, setNewMachine] = useState<MachineType>('wheel');

  const handleCreate = () => {
    if (!newName) return;
    const session = createSession(newName, newPrizes, newMachine);
    navigate(`/edit/${session.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 font-['Nunito']">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
              <img 
                src="/Ruii logo black.jpg" 
                alt="Ruii Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-5xl font-['Lilita_One'] text-yellow-400 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] tracking-wider">
                RUII'S LUCKY DRAW
              </h1>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-6 px-8 rounded-2xl shadow-[0_6px_0_#9d174d] active:translate-y-1 active:shadow-none transition-all"
          >
            <Plus className="mr-2" /> NEW DRAW
          </Button>
        </header>

        {isCreating && (
          <Card className="mb-12 bg-slate-800 border-slate-700 text-white animate-in slide-in-from-top duration-300">
            <CardHeader>
              <CardTitle className="font-['Lilita_One'] text-2xl text-pink-400">Create New Session</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Session Name</Label>
                <Input 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Annual Party 2025"
                  className="bg-slate-900 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Number of Prizes</Label>
                <Input 
                  type="number" 
                  min="1"
                  value={newPrizes} 
                  onChange={(e) => setNewPrizes(parseInt(e.target.value))}
                  className="bg-slate-900 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Machine Type</Label>
                <Select value={newMachine} onValueChange={(v: MachineType) => setNewMachine(v)}>
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
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
              <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">Create & Setup</Button>
            </CardFooter>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessions.map(session => (
            <Card key={session.id} className="bg-slate-800 border-slate-700 text-white hover:border-pink-500 transition-colors group">
              <CardHeader>
                <CardTitle className="font-['Lilita_One'] text-xl flex justify-between items-start">
                  {session.name}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteSession(session.id)}
                    className="text-slate-500 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>{session.participants.length} Participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy size={16} />
                  <span>{session.winners.length} / {session.prizeCount} Winners</span>
                </div>
              </CardContent>
              <CardFooter className="gap-4">
                <Button 
                  onClick={() => navigate(`/edit/${session.id}`)}
                  variant="secondary"
                  className="flex-1 bg-slate-700 hover:bg-slate-600"
                >
                  Setup
                </Button>
                <Button 
                  onClick={() => navigate(`/draw/${session.id}`)}
                  className="flex-1 bg-pink-600 hover:bg-pink-700"
                >
                  <Play className="mr-2" size={16} /> Open
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {sessions.length === 0 && !isCreating && (
          <div className="text-center py-20 border-4 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500 text-xl">No sessions yet. Start by creating one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;