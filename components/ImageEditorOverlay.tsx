
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';

interface ImageEditorOverlayProps {
  image: string;
  onClose: () => void;
}

const ImageEditorOverlay: React.FC<ImageEditorOverlayProps> = ({ image, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const edited = await geminiService.editSnapshot(image, prompt);
      if (edited) {
        setResultImage(edited);
      } else {
        setError("AI couldn't process this edit request.");
      }
    } catch (err) {
      setError("Failed to communicate with AI service.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resultImage || image;
    link.download = `gemini-call-edit-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-10 bg-black/90 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white">AI Magic Edit</h3>
            <p className="text-slate-400 text-xs">Transform your meeting snapshots with Gemini 2.5</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Original / Canvas</p>
             <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 group">
                <img src={image} alt="Canvas" className="w-full h-full object-contain" />
                {isProcessing && (
                   <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-indigo-400 font-medium animate-pulse">Gemini is reimagining...</p>
                   </div>
                )}
             </div>
          </div>

          <div className="w-full md:w-80 space-y-6">
            {!resultImage ? (
              <div className="space-y-4">
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Edit Prompt</label>
                   <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. 'Add a retro cinematic filter' or 'Make the background a futuristic office'"
                    className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
                   />
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  onClick={handleEdit}
                  disabled={isProcessing || !prompt.trim()}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                >
                  Generate Edit
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Result</p>
                <div className="aspect-video rounded-xl overflow-hidden border border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] bg-black">
                   <img src={resultImage} alt="Edited" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col gap-3">
                   <button
                    onClick={handleDownload}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all"
                   >
                     Download Masterpiece
                   </button>
                   <button
                    onClick={() => { setResultImage(null); setPrompt(''); }}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                   >
                     Try Another Edit
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorOverlay;
