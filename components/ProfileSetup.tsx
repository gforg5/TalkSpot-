
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && handle.trim()) {
      const profile: UserProfile = { 
        name: name.trim(), 
        id: handle.toLowerCase().trim(), 
        avatar,
        avatarColor: 'bg-[#00f3ff]'
      };
      localStorage.setItem('talkspot_profile', JSON.stringify(profile));
      onComplete(profile);
    }
  };

  return (
    <div className="w-full max-w-md p-1 bg-[#0a0a0f] rounded-[32px] overflow-hidden shadow-2xl animate-slide-up mx-4 border border-[#00f3ff]/20">
      <div className="bg-[#020204] p-10 rounded-[30px]">
        <div className="flex flex-col items-center text-center mb-10">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative w-36 h-36 rounded-[2.5rem] bg-[#12121a] border-2 border-[#00f3ff]/20 flex items-center justify-center cursor-pointer group hover:border-[#00f3ff] transition-all overflow-hidden mb-8 ring-8 ring-[#00f3ff]/5"
          >
            {avatar ? (
              <img src={avatar} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-[#00f3ff] opacity-40 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Upload Matrix</span>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tighter italic uppercase">Neural<span className="text-[#00f3ff] neon-text">Identity</span></h2>
          <p className="text-slate-500 text-[10px] mt-3 font-bold tracking-[0.3em] uppercase">Connect your signal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-[#00f3ff] px-1 tracking-[0.3em] opacity-60">Full Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Designate yourself..."
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl px-6 py-5 text-white focus:ring-1 focus:ring-[#00f3ff]/40 focus:border-[#00f3ff]/40 outline-none transition-all placeholder-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-[#00f3ff] px-1 tracking-[0.3em] opacity-60">Global Identity</label>
            <input
              required
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. signal_alpha_01"
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl px-6 py-5 text-white focus:ring-1 focus:ring-[#00f3ff]/40 focus:border-[#00f3ff]/40 outline-none transition-all placeholder-slate-800 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-6 bg-[#00f3ff] text-[#020204] font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-95 mt-8 shadow-[0_0_30px_rgba(0,243,255,0.2)] uppercase tracking-[0.3em] text-sm italic"
          >
            Establish Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
