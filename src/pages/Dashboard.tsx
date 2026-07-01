"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLuckyDraw } from '@/hooks/use-lucky-draw';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Plus, Trash2, Play, Calendar, Users, Trophy, Settings2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MachineType } from '@/types/lucky-draw';

const Dashboard = () => {
  const { sessions, deleteSession, createSession } = useLuckyDraw();
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
    <div className="min-h-screen bg-[#020617] text-slate-50 font-['Nunito'] selection:bg-pink-500/30">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-pink-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
          <div className="flex items-center gap-6 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-violet-600 rounded-2xl blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
                <img 
                  src="/Ruii logo black.jpg" 
                  alt="Ruii Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/initials/svg?seed=Ruii&backgroundColor=ec4899';
                  }}
                />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-['Lilita_One'] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600 drop-shadow-sm">
                RUII'S LUCKY DRAW
              </h1>
            </div>
          </div>

          <Button 
            onClick={() => setIsCreating(true)}
            className="group relative px-8 py-6 bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" /> 
            CREATE NEW DRAW
          </Button>
        </header>

        {/* Create Session Modal/Card */}
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-xl bg-slate-900/90 border-slate-800 text-white shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-['Lilita_One'] text-pink-500 flex items-center gap-2">
                  <Settings2 className="h-6 w-6" />
                  New Draw Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-400">Session Name</Label>
                  <Input 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Grand Gala 2025"
                    className="bg-slate-950/50 border-slate-800 focus:border-pink-500/50 h-12 text-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-400">Prizes</Label>
                    <Input 
                      type="number" 
                      min="1"
                      value={newPrizes} 
                      onChange={(e) => setNewPrizes(parseInt(e.target.value))}
                      className="bg-slate-950/50 border-slate-800 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Machine</Label>
                    <Select value={newMachine} onValueChange={(v: MachineType) => setNewMachine(v)}>
                      <SelectTrigger className="bg-slate-950/50 border-slate-800 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="wheel">Spinning Wheel 🎡</SelectItem>
                        <SelectItem value="ball">Ball Machine 🎱</SelectItem>
                        <SelectItem value="gacha">Gacha Capsule 🎪</SelectItem>
                        <SelectItem value="pachinko">Pachinko Board ⛓️</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                  Cancel
                </Button>
                <Button onClick={handleCreate} className="bg-pink-600 hover:bg-pink-700 px-8">
                  Create & Setup
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <Card key={session.id} className="group relative bg-slate-900/40 border-slate-800/50 hover:border-pink-500/50 transition-all duration-500 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold text-slate-100 group-hover:text-pink-400 transition-colors">
                    {session.name}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteSession(session.id)}
                    className="relative z-10 text-slate-600 hover:text-red-400 hover:bg-red-400/10 -mt-2 -mr-2"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Users size={14} className="text-blue-400" />
                    <span>{session.participants.length} Joined</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Trophy size={14} className="text-yellow-400" />
                    <span>{session.winners.length}/{session.prizeCount} Won</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Calendar size={12} />
                  <span>Created {new Date(session.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>

              <CardFooter className="gap-3 pt-2 relative z-10">
                <Button 
                  onClick={() => navigate(`/edit/${session.id}`)}
                  variant="outline"
                  className="flex-1 bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300"
                >
                  Setup
                </Button>
                <Button 
                  onClick={() => navigate(`/draw/${session.id}`)}
                  className="flex-1 bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-900/20"
                >
                  <Play className="mr-2 h-4 w-4 fill-current" /> Open
                </Button>
              </CardFooter>
            </Card>
          ))}

          {/* Empty State */}
          {sessions.length === 0 && !isCreating && (
            <div 
              onClick={() => setIsCreating(true)}
              className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl hover:border-slate-700 hover:bg-slate-900/20 transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="text-slate-500 group-hover:text-pink-500" size={32} />
              </div>
              <p className="text-slate-500 text-lg font-medium">No active draws. Create your first one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;