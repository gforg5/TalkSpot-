
import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'info' | 'error' | 'success';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    info: 'bg-blue-600 border-blue-400',
    error: 'bg-red-600 border-red-400',
    success: 'bg-emerald-600 border-emerald-400',
  };

  return (
    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl border-2 text-white font-medium shadow-2xl z-[100] animate-in slide-in-from-bottom-10 ${styles[type]}`}>
      <div className="flex items-center gap-3">
        {type === 'error' && (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-70">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
        </button>
      </div>
    </div>
  );
};

export default Notification;
