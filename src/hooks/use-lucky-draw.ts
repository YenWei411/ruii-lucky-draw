"use client";

import { useState, useEffect, useCallback } from 'react';
import { LuckyDrawSession, Participant, Winner, MachineType } from '@/types/lucky-draw';

const STORAGE_KEY = 'luckyDraw_sessions';

export const useLuckyDraw = () => {
  const [sessions, setSessions] = useState<LuckyDrawSession[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }
  }, []);

  const saveSessions = useCallback((newSessions: LuckyDrawSession[]) => {
    setSessions(newSessions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
  }, []);

  const createSession = useCallback((name: string, prizeCount: number, machineType: MachineType) => {
    const newSession: LuckyDrawSession = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      prizeCount,
      participants: [],
      winners: [],
      machineType
    };
    saveSessions([...sessions, newSession]);
    return newSession;
  }, [sessions, saveSessions]);

  const updateSession = useCallback((updatedSession: LuckyDrawSession) => {
    const newSessions = sessions.map(s => s.id === updatedSession.id ? updatedSession : s);
    saveSessions(newSessions);
  }, [sessions, saveSessions]);

  const deleteSession = useCallback((id: string) => {
    saveSessions(sessions.filter(s => s.id !== id));
  }, [sessions, saveSessions]);

  return { sessions, createSession, updateSession, deleteSession };
};