
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Contact } from '../types';

interface RoomSetupProps {
  onJoin: (targetId: string) => void;
  error: string | null;
  profile: UserProfile;
}

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Neural Core', handle: 'core_service', initials: 'NC', status: 'online' },
  { id: '2', name: 'Support Node', handle: 'support_sys', initials: 'SN', status: 'online' },
  { id: '3', name: 'Echo Test', handle: 'echo_pulse', initials: 'EP', status: 'online' },
];

const RoomSetup: React.FC<RoomSetupProps> = ({ onJoin, error, profile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setPreviewStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => console.error("Hardware link error:", err));
    return () => {
        if (previewStream) {
            previewStream.getTracks().forEach(t => t.stop());
        }
    };
  }, []);

  const startCall = (id?: string) => {
    const finalId = id || searchQuery;
    if (finalId.trim()) {
      onJoin(finalId.trim().toLowerCase());
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto h-full bg-[#020204] animate-slide-up border-x border-white/5">
      
      {/* Dynamic Header */}
      <div className="px-10 pt-16 pb-12 flex items-center justify-between border-b border-white/5">
         <div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter">NODE_<span className="text-[#00f3ff]">{profile.name.toUpperCase()}</span></h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-2">Neural Link: Standby</p>
         </div>
         <div className="w-16 h-16 rounded-2xl bg-[#00f3ff]/10 border border-[#00f3ff]/20 flex items-center justify-center">
            {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover rounded-2xl" /> : <span className="text-[#00f3ff] font-black text-xl">{profile.name[0]}</span>}
         </div>
      </div>

      {/* Primary Action Zone */}
      <div className="flex-1 px-10 py-12 space-y-12">
        <div className="space-y-4">
           <label className="text-[10px] font-black text-[#00f3ff] uppercase tracking-[0.4em]">Initialize Connection</label>
           <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="TARGET_IDENTITY_KEY"
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl px-8 py-6 text-white text-xl font-black placeholder-slate-800 outline-none focus:border-[#00f3ff]/40 transition-all font-mono italic"
                onKeyPress={(e) => e.key === 'Enter' && startCall()}
              />
              <button 
                onClick={() => startCall()}
                disabled={!searchQuery.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-8 h-12 bg-[#00f3ff] text-[#020204] rounded-xl font-black uppercase tracking-widest text-[10px] italic shadow-lg shadow-[#00f3ff]/20 disabled:opacity-20 transition-all"
              >
                Sync
              </button>
           </div>
        </div>

        {/* Node Directory */}
        <div className="space-y-6">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Verified Target Nodes</label>
           <div className="grid gap-3">
              {MOCK_CONTACTS.map(contact => (
                <div 
                  key={contact.id} 
                  onClick={() => startCall(contact.handle)}
                  className="flex items-center justify-between p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl hover:border-[#00f3ff]/30 cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-black border border-white/10 flex items-center justify-center font-bold text-slate-400 group-hover:text-[#00f3ff]">
                      {contact.initials}
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold tracking-tight">{contact.name}</h4>
                      <p className="text-[9px] text-slate-500 font-mono">{contact.handle}</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-slate-700 group-hover:text-[#00f3ff] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Hardware Link Status HUD */}
      <div className="p-8 bg-[#0a0a0f] border-t border-white/5">
        <div className="flex items-center gap-4">
           <div className="w-24 h-14 bg-black rounded-xl overflow-hidden border border-white/10">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror opacity-30" />
           </div>
           <div className="flex-1">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-[#00f3ff] rounded-full animate-pulse shadow-[0_0_8px_#00f3ff]" />
                 <span className="text-[9px] font-black text-[#00f3ff] uppercase tracking-[0.3em]">Neural Link Ready</span>
              </div>
              <p className="text-[10px] text-white/50 italic tracking-tight uppercase mt-0.5">Hardware synchronization verified</p>
           </div>
        </div>
      </div>

      {error && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-[#ff0055] text-white font-black italic rounded-xl shadow-2xl z-[200] uppercase tracking-widest text-[9px]">
          Uplink Error: {error}
        </div>
      )}
    </div>
  );
};

export default RoomSetup;
