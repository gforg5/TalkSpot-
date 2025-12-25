
import React from 'react';
import { Transcript } from '../types';

interface SidebarProps {
  isOpen: boolean;
  transcripts: Transcript[];
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, transcripts, onClose }) => {
  return (
    <div className={`fixed lg:relative top-0 right-0 h-full w-80 bg-slate-900 border-l border-white/5 transition-transform duration-500 z-[100] ${isOpen ? 'translate-x-0' : 'translate-x-full lg:hidden'}`}>
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
             <h3 className="text-lg font-bold text-white tracking-tight">Intelligence Feed</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Close Panel"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {transcripts.length === 0 ? (
            <div className="text-center py-20 opacity-50">
               <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
               </div>
               <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black leading-loose">Transcription Active<br/>Waiting for signal</p>
            </div>
          ) : (
            transcripts.map((t) => (
              <div key={t.id} className={`space-y-1 animate-in slide-in-from-right-2 duration-300 ${t.sender === 'You' ? 'text-right' : 'text-left'}`}>
                <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest px-1">{t.sender}</p>
                <div className={`p-4 rounded-[20px] text-sm leading-relaxed shadow-lg ${t.sender === 'You' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'}`}>
                  {t.text}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-black/10">
           <div className="flex items-center gap-3 px-5 py-4 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
              <div className="flex gap-1">
                 <div className="w-1 h-3 bg-violet-500 rounded-full animate-[bounce_1s_infinite]" />
                 <div className="w-1 h-3 bg-violet-400 rounded-full animate-[bounce_1.2s_infinite]" />
                 <div className="w-1 h-3 bg-violet-300 rounded-full animate-[bounce_0.8s_infinite]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gemini Neural Processor</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
