
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import React, { useState, useEffect, useRef } from 'react';
import { CallStatus, Transcript, IceStatus, UserProfile } from '../types';
import VideoView from './VideoView';
import Sidebar from './Sidebar';

interface CallContainerProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onHangup: () => void;
  status: CallStatus;
  roomId: string;
  iceStatus?: IceStatus;
  profile: UserProfile;
}

const CallContainer: React.FC<CallContainerProps> = ({ 
  localStream, 
  remoteStream, 
  onHangup, 
  status,
  roomId,
  profile
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  
  const currentTranscriptionRef = useRef('');

  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
      localStream.getVideoTracks().forEach(t => t.enabled = !isVideoOff);
    }
  }, [isMuted, isVideoOff, localStream]);

  // Dedicated AI Transcription Logic
  useEffect(() => {
    if (status !== CallStatus.IN_CALL || !remoteStream) return;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    const encode = (bytes: Uint8Array) => {
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    };

    const createBlob = (data: Float32Array) => {
      const l = data.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
      }
      return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
      };
    };

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          const source = audioContext.createMediaStreamSource(remoteStream);
          const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.inputTranscription) {
            const text = message.serverContent.inputTranscription.text;
            currentTranscriptionRef.current += text;
            setTranscripts(prev => {
              const last = prev[prev.length - 1];
              if (last && last.sender === 'Partner') {
                return [...prev.slice(0, -1), { ...last, text: currentTranscriptionRef.current }];
              }
              return [...prev, { 
                id: Math.random().toString(36).substr(2, 9),
                sender: 'Partner',
                text: currentTranscriptionRef.current,
                timestamp: new Date()
              }];
            });
          }
          if (message.serverContent?.turnComplete) {
            currentTranscriptionRef.current = '';
          }
        },
        onerror: (e) => console.error('AI Sync Error:', e),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        systemInstruction: 'You are a professional real-time transcription module.',
      },
    });

    return () => {
      sessionPromise.then(s => s.close());
      audioContext.close();
    };
  }, [status, remoteStream]);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#020204] overflow-hidden flex flex-col">
      
      {/* Immersive Video Layer */}
      <div className="flex-1 relative flex transition-all duration-500 overflow-hidden">
        <div className={`flex-1 relative transition-all duration-700 ${sidebarOpen ? 'mr-80' : ''}`}>
          {remoteStream ? (
            <VideoView id="remote-video" stream={remoteStream} isLocal={false} label="REMOTE_NODE_ACTIVE" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#050508]">
              <div className="w-20 h-20 rounded-full border border-[#00f3ff]/20 flex items-center justify-center mb-6">
                <div className="w-2 h-2 bg-[#00f3ff] rounded-full animate-ping shadow-[0_0_15px_#00f3ff]" />
              </div>
              <h2 className="text-white text-xl font-bold tracking-[0.2em] italic opacity-80">WAITING FOR HANDSHAKE</h2>
              <p className="text-[#00f3ff] mt-2 text-[9px] font-black uppercase tracking-[0.4em]">NODE: {roomId.toUpperCase()}</p>
            </div>
          )}

          {/* User Self View - Sleek Floating PiP */}
          <div className="absolute top-10 right-10 w-48 sm:w-64 aspect-video rounded-2xl overflow-hidden border border-[#00f3ff]/30 z-40 shadow-2xl transition-transform hover:scale-105 bg-[#0a0a0f]">
             {localStream && !isVideoOff ? (
                <VideoView 
                  id="local-video" 
                  stream={localStream} 
                  isLocal={true} 
                  label="UPLINK_STABLE" 
                  muted 
                />
             ) : (
               <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-2">
                 <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                 </div>
                 <span className="text-[10px] font-black text-slate-700 tracking-widest uppercase">Video Offline</span>
               </div>
             )}
          </div>

          {/* Dynamic AI Caption Overlay */}
          {transcripts.length > 0 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8 pointer-events-none">
              <div className="bg-black/80 backdrop-blur-xl px-8 py-4 rounded-2xl border border-[#00f3ff]/20 text-center shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                 <p className="text-[#00f3ff] text-xl font-medium tracking-tight neon-text">
                    {transcripts[transcripts.length - 1].text}
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Industrial Minimalist Control Bar */}
      <div className="h-28 px-10 flex items-center justify-between z-[60] bg-[#020204] border-t border-white/5">
        <div className="flex-1 flex items-center gap-4">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#00f3ff] tracking-widest italic uppercase opacity-60">Session_Identity</span>
              <span className="text-white font-mono text-xs tracking-tighter">{roomId.toUpperCase()}</span>
           </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all border ${isMuted ? 'bg-[#00f3ff]/10 border-[#00f3ff]/40 text-[#00f3ff]' : 'bg-white/5 border-white/10 text-white hover:border-[#00f3ff]/30'}`}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            )}
          </button>

          <button 
            onClick={() => setIsVideoOff(!isVideoOff)} 
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all border ${isVideoOff ? 'bg-[#00f3ff]/10 border-[#00f3ff]/40 text-[#00f3ff]' : 'bg-white/5 border-white/10 text-white hover:border-[#00f3ff]/30'}`}
          >
            {isVideoOff ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            )}
          </button>

          <button 
            onClick={onHangup} 
            className="px-8 h-14 bg-[#0a0a0f] text-[#00f3ff] border border-[#00f3ff]/30 rounded-xl font-black uppercase tracking-widest text-[10px] italic hover:bg-[#00f3ff] hover:text-[#020204] hover:border-[#00f3ff] transition-all"
          >
            Disconnect
          </button>
        </div>

        <div className="flex-1 flex justify-end">
           <button 
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className={`p-3 rounded-lg transition-all ${sidebarOpen ? 'text-[#00f3ff]' : 'text-slate-500 hover:text-white'}`}
           >
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
           </button>
        </div>
      </div>

      <Sidebar 
        isOpen={sidebarOpen} 
        transcripts={transcripts} 
        onClose={() => setSidebarOpen(false)} 
      />
    </div>
  );
};

export default CallContainer;
