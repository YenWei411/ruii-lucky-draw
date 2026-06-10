export type MachineType = "wheel" | "ball" | "gacha" | "pachinko";

export interface Participant {
  id: string;
  name: string;
  tickets: number;
  muted: boolean;
  hasWon: boolean;
}

export interface Winner {
  participantId: string;
  name: string;
  prizeNumber: number;
  drawnAt: number;
  machineType: MachineType;
}

export interface LuckyDrawSession {
  id: string;
  name: string;
  createdAt: number;
  prizeCount: number;
  participants: Participant[];
  winners: Winner[];
  machineType: MachineType;
}