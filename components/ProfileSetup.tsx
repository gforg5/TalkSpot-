
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
      if (file.size > 1024 * 1024) {
        alert("Image too large. Please select an image under 1MB.");
        return;
      }
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
        avatarColor: 'bg-[#00a884]'
      };
      localStorage.setItem('talkspot_profile', JSON.stringify(profile));
      onComplete(profile);
    }
  };

  return (
    <div className="w-full max-w-sm p-10 bg-[#111b21] rounded-[40px] shadow-2xl animate-slide-up border border-white/5 mx-4">
      <div className="flex flex-col items-center text-center mb-10">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative w-32 h-32 rounded-full bg-[#202c33] border-4 border-[#00a884]/20 flex items-center justify-center cursor-pointer group hover:border-[#00a884] transition-all overflow-hidden mb-6 ring-4 ring-black/20 shadow-xl"
        >
          {avatar ? (
            <img src={avatar} className="w-full h-full object-cover" alt="Profile Preview" />
          ) : (
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-[#8696a0] group-hover:text-[#00a884] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              <span className="text-[10px] text-[#8696a0] mt-1 font-bold uppercase tracking-widest">Add Photo</span>
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        </div>
        <h2 className="text-3xl font-bold text-[#e9edef] tracking-tight">TalkSpot Profile</h2>
        <p className="text-[#8696a0] text-sm mt-2">Enter details so others can reach you.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-[#00a884] px-1 tracking-wider">Full Name</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Smith"
            className="w-full bg-[#202c33] border-none rounded-2xl px-5 py-4 text-[#e9edef] focus:ring-2 focus:ring-[#00a884] outline-none transition-all placeholder-[#8696a0]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-[#00a884] px-1 tracking-wider">Unique Identity (ID/PH/Mail)</label>
          <input
            required
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="e.g. john_123 or +1..."
            className="w-full bg-[#202c33] border-none rounded-2xl px-5 py-4 text-[#e9edef] focus:ring-2 focus:ring-[#00a884] outline-none transition-all font-medium placeholder-[#8696a0]"
          />
        </div>

        <button
          type="submit"
          className="w-full py-5 bg-[#00a884] hover:bg-[#06cf9c] text-[#111b21] font-bold rounded-2xl transition-all active:scale-95 mt-6 shadow-lg shadow-[#00a884]/20"
        >
          Get Started
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
