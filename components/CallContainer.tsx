
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import React, { useState, useEffect, useRef } from 'react';
import { CallStatus, Transcript, IceStatus, UserProfile } from '../types';
import Controls from './Controls';
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
  iceStatus = 'new',
  profile
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  
  const currentTranscriptionRef = useRef('');

  // Sync state with tracks
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
      localStream.getVideoTracks().forEach(t => t.enabled = !isVideoOff);
    }
  }, [isMuted, isVideoOff, localStream]);

  // AI Transcription Logic
  useEffect(() => {
    if (status !== CallStatus.IN_CALL || !remoteStream) return;

    // Fix: Initializing GoogleGenAI right before connection as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    // Helper to encode PCM to base64
    const encode = (bytes: Uint8Array) => {
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    };

    // Helper to create the audio blob for Gemini
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
          console.debug('AI Transcription Session Connected');
          const source = audioContext.createMediaStreamSource(remoteStream);
          const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            // Fix: Relying on sessionPromise to send input only after connection is ready
            sessionPromise.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };

          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          // Gemini Live API sends transcription of the "input" (the remote participant in this case)
          if (message.serverContent?.inputTranscription) {
            const text = message.serverContent.inputTranscription.text;
            currentTranscriptionRef.current += text;
            
            // Streaming UI update for better UX
            setTranscripts(prev => {
              const last = prev[prev.length - 1];
              if (last && last.sender === 'Partner' && (Date.now() - last.timestamp.getTime() < 5000)) {
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
        onerror: (e) => console.error('Transcription Error:', e),
        onclose: () => console.debug('Transcription Session Closed'),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        systemInstruction: 'You are a transcription assistant. Your only job is to provide real-time captions for a conversation. Do not respond verbally.',
      },
    });

    return () => {
      sessionPromise.then(s => s.close());
      audioContext.close();
    };
  }, [status, remoteStream]);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#202124] overflow-hidden flex flex-col font-sans">
      
      {/* 1. Main Content Area */}
      <div className="flex-1 relative flex p-4 gap-4 transition-all duration-300">
        <div className={`flex-1 relative video-container transition-all duration-500 ${sidebarOpen ? 'mr-80' : ''}`}>
          {remoteStream ? (
            <VideoView id="remote-video" stream={remoteStream} isLocal={false} label="Participant" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-10">
              <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
              </div>
              <h3 className="text-white text-xl font-medium">Waiting for others to join</h3>
              <p className="text-gray-500 mt-2 text-sm">Meeting ID: <span className="font-mono">{roomId}</span></p>
            </div>
          )}

          {/* Local PiP: Self View (Floating) */}
          <div className="absolute bottom-6 right-6 w-32 sm:w-64 aspect-video video-container meet-shadow border border-gray-700 z-40 overflow-hidden shadow-2xl transition-all">
             {localStream && (
                <VideoView 
                  id="local-video" 
                  stream={localStream} 
                  isLocal={true} 
                  label="You" 
                  muted 
                />
             )}
             {/* Fix: Resolved "Cannot find name 'profile'" by receiving it as a prop */}
             {isVideoOff && (
               <div className="absolute inset-0 bg-[#202124] flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {profile?.name[0] || 'Y'}
                  </div>
               </div>
             )}
          </div>

          {/* Live Caption Overlay (Meet Style) */}
          {transcripts.length > 0 && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 pointer-events-none">
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-center">
                 <p className="text-white text-lg font-medium drop-shadow-lg">
                    {transcripts[transcripts.length - 1].text}
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Bottom Controls Bar */}
      <div className="h-24 px-6 flex items-center justify-between z-[60] relative bg-[#202124]">
        <div className="flex-1 flex items-center gap-4 text-white overflow-hidden">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm font-medium hover:bg-white/5 px-4 py-2 rounded-lg transition-colors truncate max-w-[200px]"
          >
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {roomId}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className={`w-12 h-12 control-btn ${isMuted ? 'bg-red-500 text-white' : 'bg-[#3c4043] hover:bg-[#434649] text-white'} rounded-full flex items-center justify-center transition-all`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            )}
          </button>

          <button 
            onClick={() => setIsVideoOff(!isVideoOff)} 
            className={`w-12 h-12 control-btn ${isVideoOff ? 'bg-red-500 text-white' : 'bg-[#3c4043] hover:bg-[#434649] text-white'} rounded-full flex items-center justify-center transition-all`}
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            )}
          </button>

          <button 
            onClick={onHangup} 
            className="w-20 h-12 control-btn bg-red-500 hover:bg-red-600 text-white rounded-[24px] flex items-center justify-center transition-all"
            title="Leave call"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-end gap-2">
           <button 
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className={`w-12 h-12 control-btn hover:bg-white/5 rounded-full flex items-center justify-center transition-all ${sidebarOpen ? 'text-[#00a884]' : 'text-white'}`}
           >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
           </button>
        </div>
      </div>

      {/* 3. Meeting Info Popover */}
      {showDetails && (
        <div className="absolute bottom-28 left-6 w-80 bg-white dark:bg-[#202124] rounded-lg shadow-2xl p-6 border border-gray-700 z-[100] animate-meet-in">
          <div className="flex items-center justify-between mb-4">
             <h4 className="text-lg font-medium">Meeting details</h4>
             <button onClick={() => setShowDetails(false)} className="text-gray-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
          <p className="text-sm text-gray-400 mb-2">Joining info</p>
          <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded mb-4">
             <span className="text-sm font-mono truncate mr-2">talkspot.com/{roomId}</span>
             <button 
              onClick={() => navigator.clipboard.writeText(`https://talkspot.com/${roomId}`)}
              className="text-[#00a884] hover:text-[#06cf9c] p-1"
             >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
             </button>
          </div>
          <button className="text-sm text-[#00a884] hover:underline">Copy joining info</button>
        </div>
      )}

      {/* 4. Side Panels */}
      <Sidebar 
        isOpen={sidebarOpen} 
        transcripts={transcripts} 
        onClose={() => setSidebarOpen(false)} 
      />
    </div>
  );
};

export default CallContainer;
