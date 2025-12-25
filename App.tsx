
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CallStatus, SignalingMessage, IceStatus, UserProfile } from './types';
import RoomSetup from './components/RoomSetup';
import CallContainer from './components/CallContainer';
import Header from './components/Header';
import Notification from './components/Notification';
import ProfileSetup from './components/ProfileSetup';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('talkspot_profile');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [roomId, setRoomId] = useState<string>('');
  const [status, setStatus] = useState<CallStatus>(CallStatus.IDLE);
  const [iceStatus, setIceStatus] = useState<IceStatus>('new');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  // Sync profile state across tabs and handle logout immediately
  useEffect(() => {
    const syncProfile = () => {
      const saved = localStorage.getItem('talkspot_profile');
      if (!saved) {
        setProfile(null);
        cleanup();
      } else {
        setProfile(JSON.parse(saved));
      }
    };
    window.addEventListener('storage', syncProfile);
    return () => window.removeEventListener('storage', syncProfile);
  }, []);

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (channelRef.current) {
      channelRef.current.close();
      channelRef.current = null;
    }
    setRemoteStream(null);
    setStatus(CallStatus.IDLE);
    setIceStatus('new');
    setRoomId('');
  }, [localStream]);

  const initWebRTC = useCallback(async (id: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.oniceconnectionstatechange = () => {
      setIceStatus(pc.iceConnectionState as IceStatus);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current && profile) {
        channelRef.current.postMessage({
          type: 'candidate',
          payload: event.candidate,
          sender: profile.id,
          roomId: id
        } as SignalingMessage);
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pcRef.current = pc;
    return pc;
  }, [profile]);

  const handleJoinRoom = async (id: string) => {
    if (!profile) return;
    try {
      setRoomId(id);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setStatus(CallStatus.CONNECTING);
      
      // Close previous channel if any
      if (channelRef.current) channelRef.current.close();
      
      channelRef.current = new BroadcastChannel(`talkspot_${id}`);
      
      const pc = await initWebRTC(id);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Signaling logic
      channelRef.current.onmessage = async (event: MessageEvent<SignalingMessage>) => {
        const msg = event.data;
        if (msg.sender === profile.id || msg.roomId !== id) return;

        switch (msg.type) {
          case 'join':
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            channelRef.current?.postMessage({ type: 'offer', payload: offer, sender: profile.id, roomId: id });
            break;
          case 'offer':
            await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            channelRef.current?.postMessage({ type: 'answer', payload: answer, sender: profile.id, roomId: id });
            setStatus(CallStatus.IN_CALL);
            break;
          case 'answer':
            await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
            setStatus(CallStatus.IN_CALL);
            break;
          case 'candidate':
            await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
            break;
          case 'hangup':
            cleanup();
            break;
        }
      };

      // Broadcast join intent
      channelRef.current.postMessage({ type: 'join', sender: profile.id, roomId: id } as SignalingMessage);
      
    } catch (err: any) {
      console.error(err);
      setError("Camera/Microphone access is required for TalkSpot.");
      setStatus(CallStatus.ERROR);
    }
  };

  const handleHangup = () => {
    if (channelRef.current && profile) {
      channelRef.current.postMessage({ type: 'hangup', sender: profile.id, roomId });
    }
    cleanup();
  };

  const handleLogout = () => {
    localStorage.removeItem('talkspot_profile');
    setProfile(null);
    cleanup();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0b141a]">
      {status === CallStatus.IDLE && profile && (
        <Header status={status} onLogout={handleLogout} />
      )}
      <main className="flex-1 relative flex items-center justify-center">
        {!profile ? (
          <ProfileSetup onComplete={setProfile} />
        ) : (status === CallStatus.IDLE || status === CallStatus.ERROR ? (
          <RoomSetup onJoin={handleJoinRoom} error={error} profile={profile} />
        ) : (
          <CallContainer 
            localStream={localStream}
            remoteStream={remoteStream}
            onHangup={handleHangup}
            status={status}
            roomId={roomId}
            iceStatus={iceStatus}
          />
        ))}
      </main>
      {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
    </div>
  );
};

export default App;
