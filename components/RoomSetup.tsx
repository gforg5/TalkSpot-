
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Contact } from '../types';

interface RoomSetupProps {
  onJoin: (targetId: string) => void;
  error: string | null;
  profile: UserProfile;
}

const MOCK_RECENTS: Contact[] = [
  { id: '1', name: 'Global Support', handle: 'talkspot_hq', initials: 'TS', status: 'online' },
  { id: '2', name: 'Echo Test', handle: 'echo_service', initials: 'ET', status: 'online' },
];

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Global Support', handle: 'talkspot_hq', initials: 'TS', status: 'online' },
  { id: '2', name: 'Echo Test', handle: 'echo_service', initials: 'ET', status: 'online' },
  { id: '3', name: 'Sarah Chen', handle: 'sarah@talkspot.com', initials: 'SC', status: 'online' },
  { id: '4', name: 'Alex Rivera', handle: '+15550199', initials: 'AR', status: 'offline' },
  { id: '5', name: 'Jordan Lee', handle: 'jlee_dev', initials: 'JL', status: 'busy' },
  { id: '6', name: 'Taylor Swift', handle: 'taylor_swift', initials: 'TS', status: 'offline' },
];

const RoomSetup: React.FC<RoomSetupProps> = ({ onJoin, error, profile }) => {
  const [activeTab, setActiveTab] = useState<'calls' | 'contacts' | 'settings'>('calls');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setPreviewStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => console.error("Media error:", err));
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'busy': return 'bg-amber-500';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto h-full bg-[#0b141a] animate-slide-up relative">
      
      {/* WhatsApp Style Navigation */}
      <div className="bg-[#202c33] flex text-sm font-bold uppercase tracking-wider border-b border-white/5 pt-2">
        <button 
          onClick={() => setActiveTab('calls')}
          className={`flex-1 py-4 transition-all ${activeTab === 'calls' ? 'text-[#00a884] border-b-4 border-[#00a884]' : 'text-[#8696a0] hover:text-[#e9edef]'}`}
        >
          Calls
        </button>
        <button 
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 py-4 transition-all ${activeTab === 'contacts' ? 'text-[#00a884] border-b-4 border-[#00a884]' : 'text-[#8696a0] hover:text-[#e9edef]'}`}
        >
          Contacts
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-4 transition-all ${activeTab === 'settings' ? 'text-[#00a884] border-b-4 border-[#00a884]' : 'text-[#8696a0] hover:text-[#e9edef]'}`}
        >
          Settings
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'calls' && (
          <div className="p-4 space-y-1">
            <p className="text-[11px] font-bold text-[#00a884] uppercase tracking-[0.2em] mb-4 px-3 mt-2">Recent Records</p>
            
            {MOCK_RECENTS.map(contact => (
              <div 
                key={contact.id} 
                onClick={() => startCall(contact.handle)}
                className="flex items-center gap-4 p-4 hover:bg-[#202c33] transition-all rounded-[24px] cursor-pointer group mb-1 border border-transparent hover:border-white/5"
              >
                <div className="w-12 h-12 rounded-full bg-[#111b21] border border-white/5 flex items-center justify-center font-bold text-[#00a884] group-hover:scale-105 transition-transform text-lg relative">
                  {contact.initials}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0b141a] ${getStatusColor(contact.status)}`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[#e9edef] font-bold">{contact.name}</h3>
                    <span className="text-[10px] text-[#8696a0] font-medium">Recently</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#8696a0] text-xs">
                    <svg className="w-3 h-3 text-[#00a884]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {contact.handle}
                  </div>
                </div>
                <div className="p-2 text-[#00a884] opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            ))}

            <div className="px-3 py-6 mt-4">
               <div className="bg-[#1a2329] border border-[#00a884]/10 rounded-[32px] p-6 text-center">
                  <p className="text-[#8696a0] text-xs mb-4">Wanna call someone new? Search for their unique Phone, Email or ID.</p>
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="px-8 py-3 bg-[#00a884] text-[#111b21] rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
                  >
                    Start New Call
                  </button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="p-4 space-y-1">
            <p className="text-[11px] font-bold text-[#00a884] uppercase tracking-[0.2em] mb-4 px-3 mt-2">All Contacts</p>
            {MOCK_CONTACTS.map(contact => (
              <div 
                key={contact.id} 
                onClick={() => startCall(contact.handle)}
                className="flex items-center gap-4 p-4 hover:bg-[#202c33] transition-all rounded-[24px] cursor-pointer group mb-1 border border-transparent hover:border-white/5"
              >
                <div className="w-12 h-12 rounded-full bg-[#111b21] border border-white/5 flex items-center justify-center font-bold text-[#00a884] group-hover:scale-105 transition-transform text-lg relative">
                  {contact.initials}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0b141a] ${getStatusColor(contact.status)}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#e9edef] font-bold">{contact.name}</h3>
                  <p className="text-[#8696a0] text-xs font-mono">{contact.handle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${contact.status === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-700/50 text-slate-500'}`}>
                    {contact.status}
                  </span>
                  <button className="p-2 text-[#00a884] hover:bg-[#00a884]/10 rounded-full transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-8 space-y-6 text-center">
            <div className="w-20 h-20 mx-auto bg-[#202c33] rounded-full flex items-center justify-center text-[#8696a0] mb-4">
               <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
               </svg>
            </div>
            <h3 className="text-[#e9edef] font-bold text-xl">App Settings</h3>
            <p className="text-[#8696a0] text-sm">Configure your camera, microphone and privacy preferences.</p>
            <div className="space-y-3 pt-6">
               <button className="w-full py-4 bg-[#202c33] rounded-2xl text-[#e9edef] font-medium hover:bg-white/5 transition-all text-left px-6 flex justify-between items-center">
                 <span>Device Permissions</span>
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
               </button>
               <button className="w-full py-4 bg-[#202c33] rounded-2xl text-[#e9edef] font-medium hover:bg-white/5 transition-all text-left px-6 flex justify-between items-center">
                 <span>Account Privacy</span>
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
               </button>
            </div>
          </div>
        )}

        {/* Floating Mini Preview at bottom of list */}
        <div className="px-6 mt-4">
           <div className="aspect-[16/9] bg-[#111b21] rounded-[32px] overflow-hidden relative border border-white/5 shadow-2xl">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror opacity-40 blur-[1px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b141a] via-transparent to-[#0b141a]/20" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#00a884]/10 flex items-center justify-center text-[#00a884] mb-2">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80">Camera Ready</span>
              </div>
           </div>
        </div>
      </div>

      {/* Floating Action Button (New Call Modal) */}
      <button 
        onClick={() => setIsSearchOpen(true)}
        className="absolute bottom-8 right-8 w-16 h-16 bg-[#00a884] rounded-full shadow-2xl flex items-center justify-center text-[#111b21] hover:scale-110 active:scale-95 transition-all z-20"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
      </button>

      {/* New Call Search Layer */}
      {isSearchOpen && (
        <div className="absolute inset-0 bg-[#0b141a] z-[100] flex flex-col animate-slide-up">
           <div className="bg-[#202c33] px-4 pt-8 pb-4 flex items-center gap-4">
              <button onClick={() => setIsSearchOpen(false)} className="p-2 text-[#8696a0] hover:text-white transition-colors">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="flex-1">
                <h2 className="text-[#e9edef] font-bold text-lg">New Call</h2>
                <p className="text-[10px] text-[#00a884] font-bold uppercase tracking-widest">Type Identity below</p>
              </div>
           </div>

           <div className="p-8 space-y-8 flex-1">
              <div className="relative group">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ID, Phone or Email"
                  className="w-full bg-[#202c33] border-none rounded-[28px] px-8 py-6 text-[#e9edef] text-xl font-bold placeholder-[#8696a0] outline-none focus:ring-4 focus:ring-[#00a884]/20 transition-all shadow-xl"
                  onKeyPress={(e) => e.key === 'Enter' && startCall()}
                />
                <button 
                  onClick={() => startCall()}
                  disabled={!searchQuery.trim()}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-[#00a884] text-[#111b21] rounded-2xl flex items-center justify-center disabled:opacity-20 transition-all hover:bg-[#06cf9c] shadow-lg shadow-[#00a884]/20"
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>

              {searchQuery.trim() && (
                <div className="bg-[#202c33] rounded-[32px] p-8 border border-[#00a884]/20 animate-slide-up shadow-2xl">
                   <div className="flex flex-col items-center text-center gap-6">
                      <div className="w-20 h-20 rounded-full bg-[#00a884]/10 text-[#00a884] flex items-center justify-center font-bold text-3xl ring-4 ring-[#00a884]/5">?</div>
                      <div className="flex-1">
                         <p className="text-[#8696a0] text-sm mb-1 uppercase tracking-widest font-bold">Ready to connect to:</p>
                         <p className="text-[#e9edef] text-2xl font-black truncate max-w-[300px]">{searchQuery}</p>
                      </div>
                      <button 
                        onClick={() => startCall()} 
                        className="w-full py-5 bg-[#00a884] text-[#111b21] rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-[#06cf9c] transition-all shadow-xl"
                      >
                        Call Profile
                      </button>
                   </div>
                </div>
              )}

              {!searchQuery.trim() && (
                <div className="text-center py-10 opacity-40">
                   <div className="w-20 h-20 bg-[#202c33] rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-[#8696a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                   </div>
                   <p className="text-sm text-[#e9edef] font-medium leading-relaxed">To find your friend,<br/>search their registered TalkSpot identity.</p>
                </div>
              )}
           </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-2xl z-[200]">
          {error}
        </div>
      )}
    </div>
  );
};

export default RoomSetup;
