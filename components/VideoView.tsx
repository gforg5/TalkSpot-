
import React, { useEffect, useRef } from 'react';

interface VideoViewProps {
  id: string;
  stream: MediaStream;
  isLocal?: boolean;
  label: string;
  muted?: boolean;
}

const VideoView: React.FC<VideoViewProps> = ({ id, stream, isLocal, label, muted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-[#202124] flex items-center justify-center">
      <video
        id={id}
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isLocal ? 'mirror' : ''}`}
      />
      <div className="absolute bottom-3 left-3 z-10">
        <div className="px-3 py-1.5 bg-black/50 backdrop-blur-sm border border-white/5 rounded-md text-xs font-medium text-white flex items-center gap-2">
           {label}
        </div>
      </div>
    </div>
  );
};

export default VideoView;
