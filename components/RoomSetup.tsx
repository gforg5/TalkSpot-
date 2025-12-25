
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Contact, CallRecord } from '../types';

interface RoomSetupProps {
  onJoin: (targetId: string) => void;
  error: string | null;
  profile: UserProfile;
  friends: Contact[];
  records: CallRecord[];
  onAddFriend: (handle: string, name: string) => void;
}

const RoomSetup: React.FC<RoomSetupProps> = ({ onJoin, error, profile, friends, records, onAddFriend }) => {
  const [activeView, setActiveView] = useState<'hub' | 'records'>('hub');
  const [searchQuery, setSearchQuery] = useState('');
  const [friendName, setFriendName] = useState('');
  const [friendHandle, setFriendHandle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (friendName && friendHandle) {
      onAddFriend(friendHandle.toLowerCase(), friendName);
      setFriendName('');
      setFriendHandle('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto h-full bg-[#020204] animate-slide-up border-x border-white/5 shadow-2xl overflow-hidden">
      
      {/* Dashboard Top Bar */}
      <div className="px-10 py-12 flex items-center justify-between border-b border-white/5 bg-[#0a0a0f]/40 backdrop-blur-md">
         <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-[#00f3ff]/10 border border-[#00f3ff]/20 flex items-center justify-center p-1 group hover:border-[#00f3ff] transition-all duration-500">
               {profile.avatar ? 
                 <img src={profile.avatar} className="w-full h-full object-cover rounded-[1.8rem]" /> : 
                 <span className="text-[#00f3ff] font-black text-2xl group-hover:neon-text">{profile.name[0]}</span>
               }
            </div>
            <div>
               <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">NODE_<span className="text-[#00f3ff]">{profile.name.split(' ')[0]}</span></h2>
               <div className="flex items-center gap-2 mt-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#00f3ff] animate-pulse" />
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Neural Link ID: {profile.id}</span>
               </div>
            </div>
         </div>
         <div className="flex gap-2">
            <button 
              onClick={() => setActiveView('hub')}
              className={`p-4 rounded-xl transition-all ${activeView === 'hub' ? 'bg-[#00f3ff] text-[#020204]' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </button>
            <button 
              onClick={() => setActiveView('records')}
              className={`p-4 rounded-xl transition-all ${activeView === 'records' ? 'bg-[#00f3ff] text-[#020204]' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
         </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto px-10 py-10 pb-32 space-y-12">
        {activeView === 'hub' ? (
          <>
            {/* Instant Link Initiation */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#00f3ff] uppercase tracking-[0.4em] opacity-60">Neural Call / Join Room</label>
              <div className="relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ENTER_IDENTITY_KEY"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl px-8 py-6 text-white text-xl font-black placeholder-slate-800 outline-none focus:border-[#00f3ff]/50 hover:border-[#00f3ff]/30 transition-all duration-300 font-mono italic"
                    onKeyPress={(e) => e.key === 'Enter' && startCall()}
                  />
                  <button 
                    onClick={() => startCall()}
                    disabled={!searchQuery.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-8 h-12 bg-[#00f3ff] text-[#020204] rounded-xl font-black uppercase tracking-widest text-[10px] italic shadow-lg shadow-[#00f3ff]/20 disabled:opacity-20 transition-all hover:scale-105 active:scale-95"
                  >
                    Connect
                  </button>
              </div>
            </div>

            {/* Friends Directory */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Target Node Directory</label>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="text-[9px] font-black text-[#00f3ff] uppercase tracking-widest hover:underline"
                >
                  + Add New Node
                </button>
              </div>
              <div className="grid gap-3">
                  {friends.map(friend => (
                    <div 
                      key={friend.id} 
                      onClick={() => startCall(friend.handle)}
                      className="flex items-center justify-between p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl cursor-pointer group hover:border-[#00f3ff]/40 hover:bg-[#00f3ff]/5 transition-all duration-500"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center font-black text-slate-500 group-hover:text-[#00f3ff] group-hover:border-[#00f3ff]/30 transition-all">
                          {friend.initials}
                        </div>
                        <div>
                          <h4 className="text-white text-base font-black tracking-tight group-hover:text-[#00f3ff] transition-colors">{friend.name}</h4>
                          <p className="text-[9px] text-slate-600 font-mono group-hover:text-[#00f3ff]/60 uppercase tracking-widest mt-0.5">{friend.handle}</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#00f3ff]/50 transition-all">
                        <svg className="w-5 h-5 text-slate-800 group-hover:text-[#00f3ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          /* Records View */
          <div className="space-y-6">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Transmission History (Records)</label>
            <div className="space-y-3">
              {records.length === 0 ? (
                <div className="py-20 text-center opacity-30 italic text-sm">No historical signals detected.</div>
              ) : (
                records.map(record => (
                  <div 
                    key={record.id}
                    onClick={() => startCall(record.targetId)}
                    className="flex items-center justify-between p-6 bg-[#0a0a0f] border border-white/5 rounded-2xl hover:border-[#00f3ff]/30 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-5">
                       <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#00f3ff] group-hover:bg-[#00f3ff]/10">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                       </div>
                       <div>
                          <p className="text-white font-bold text-sm tracking-wide">ID: {record.targetId.toUpperCase()}</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">{new Date(record.timestamp).toLocaleString()}</p>
                       </div>
                    </div>
                    <span className="text-[9px] font-black text-[#00f3ff] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all italic">Recall Signal</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Persistent Hardware Monitor */}
      <div className="p-8 bg-[#0a0a0f] border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="w-24 h-14 bg-black rounded-xl overflow-hidden border border-white/10 group-hover:border-[#00f3ff]/40 transition-all">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror opacity-30" />
           </div>
           <div className="flex-1">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-[#00f3ff] rounded-full animate-pulse shadow-[0_0_8px_#00f3ff]" />
                 <span className="text-[9px] font-black text-[#00f3ff] uppercase tracking-[0.4em]">Core Interface Stable</span>
              </div>
              <p className="text-[9px] text-white/40 italic tracking-tight uppercase mt-0.5">Biometric Hardware: Synced</p>
           </div>
        </div>
        <div className="flex items-center gap-1">
           <div className="w-0.5 h-4 bg-[#00f3ff] animate-pulse" />
           <div className="w-0.5 h-6 bg-[#00f3ff] opacity-60" />
           <div className="w-0.5 h-3 bg-[#00f3ff] opacity-40" />
        </div>
      </div>

      {/* Add Friend Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in">
           <div className="w-full max-w-sm bg-[#0a0a0f] border border-[#00f3ff]/20 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-black text-white italic tracking-tighter mb-8">REGISTER_NODE</h3>
              <form onSubmit={handleAdd} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-[#00f3ff] uppercase tracking-[0.3em]">Friendly Name</label>
                    <input 
                      required
                      type="text" 
                      value={friendName}
                      onChange={(e) => setFriendName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-[#020204] border border-white/10 rounded-xl px-5 py-4 text-white focus:border-[#00f3ff]/50 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-[#00f3ff] uppercase tracking-[0.3em]">Identity Key (ID)</label>
