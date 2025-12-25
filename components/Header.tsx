
import React from 'react';
import { CallStatus } from '../types';

interface HeaderProps {
  status: CallStatus;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ status, onLogout }) => {
  return (
    <header className="px-6 py-4 flex items-center justify-between bg-[#202c33] border-b border-white/5 z-50 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#00a884] rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-[#111b21]" viewBox="0 0 24 24" fill="currentColor">
             <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold tracking-tight text-[#e9edef]">
          Talk<span className="text-[#00a884]">Spot</span>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${status === CallStatus.IN_CALL ? 'bg-[#00a884] animate-pulse' : 'bg-slate-700'}`} />
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8696a0]">
            {status === CallStatus.IN_CALL ? 'Live' : 'Secure'}
          </span>
        </div>
        
        {onLogout && (
          <button 
            onClick={onLogout}
            className="text-[#8696a0] hover:text-[#f15c6d] transition-colors"
            title="Logout"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
