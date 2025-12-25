
export enum CallStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  NEGOTIATING = 'NEGOTIATING',
  IN_CALL = 'IN_CALL',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}

export type IceStatus = 'new' | 'checking' | 'connected' | 'completed' | 'failed' | 'disconnected' | 'closed';

export interface UserProfile {
  name: string;
  id: string; // Phone, Email, or Username
  avatar?: string; // Base64 image
  avatarColor: string;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'candidate' | 'hangup' | 'join';
  payload?: any;
  sender: string;
  roomId: string;
}

export interface Transcript {
  id: string;
  sender: 'You' | 'Partner';
  text: string;
  timestamp: Date;
}

export interface Contact {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
  initials: string;
}
