
import React from 'react';
import { CallStatus } from '../types';

interface HeaderProps {
  status: CallStatus;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ status, onLogout }) => {
  return (
    <header className="px-8 py-5 flex items-center justify-between bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#00f3ff]/10 z-50 shrink-0">
      <div className="flex items-center gap-4 group">
        <div className="w-10 h-10 bg-[#00f3ff] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.3)] group-hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all">
          <svg className="w-6 h-6 text-[#020204]" viewBox="0 0 24 24" fill="currentColor">
             <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tighter text-white">
          TALK<span className="text-[#00f3ff] neon-text">SPOT</span>
          <span className="ml-2 text-[10px] font-black text-[#00f3ff] tracking-[0.4em] uppercase opacity-40">v2.5</span>
        </h1>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden sm:flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full bg-[#00f3ff] shadow-[0_0_10px_#00f3ff] ${status === CallStatus.IN_CALL ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400">
            {status === CallStatus.IN_CALL ? 'Transmission Active' : 'Neural Core Ready'}
          </span>
        </div>
        
        {onLogout && (
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#00f3ff]/20 text-slate-400 hover:text-[#00f3ff] hover:bg-[#00f3ff]/10 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Terminate Session</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
