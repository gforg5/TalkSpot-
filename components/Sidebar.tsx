
import React from 'react';
import { Transcript } from '../types';

interface SidebarProps {
  isOpen: boolean;
  transcripts: Transcript[];
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, transcripts, onClose }) => {
  return (
    <div className={`fixed top-0 bottom-0 right-0 w-80 bg-[#050508] border-l border-white/10 transition-transform duration-500 z-[100] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white italic tracking-tighter uppercase">Neural<span className="text-[#00f3ff]">_Feed</span></h3>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.3em] font-bold">Uplink Activity</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-600 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {transcripts.length === 0 ? (
            <div className="text-center py-20 opacity-20">
               <p className="text-[10px] font-black text-[#00f3ff] uppercase tracking-[0.4em] leading-loose">Awaiting Signal Synchronization...</p>
            </div>
          ) : (
            transcripts.map((t) => (
              <div key={t.id} className="space-y-2 group">
                <div className="flex items-center justify-between">
                   <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#00f3ff] opacity-40 group-hover:opacity-100 transition-opacity italic">{t.sender}</p>
                   <span className="text-[8px] text-slate-700 font-mono">{t.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-sm text-slate-300 leading-relaxed font-medium">
                  {t.text}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 border-t border-white/5 bg-[#020204]">
           <div className="flex items-center gap-3">
              <div className="flex gap-1 items-end h-3">
                 <div className="w-1 bg-[#00f3ff]/30 rounded-full animate-[bounce_1s_infinite]" style={{ height: '50%' }} />
                 <div className="w-1 bg-[#00f3ff]/80 rounded-full animate-[bounce_1.3s_infinite]" style={{ height: '100%' }} />
                 <div className="w-1 bg-[#00f3ff]/40 rounded-full animate-[bounce_0.7s_infinite]" style={{ height: '70%' }} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Core Processing</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
