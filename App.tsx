
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CallStatus, SignalingMessage, IceStatus, UserProfile, CallRecord, Contact } from './types';
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

  const [friends, setFriends] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('talkspot_friends');
    return saved ? JSON.parse(saved) : [
      { id: 'core', name: 'Neural Core', handle: 'core_service', initials: 'NC', status: 'online' }
    ];
  });

  const [records, setRecords] = useState<CallRecord[]>(() => {
    const saved = localStorage.getItem('talkspot_records');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [roomId, setRoomId] = useState<string>('');
  const [status, setStatus] = useState<CallStatus>(CallStatus.IDLE);
  const [iceStatus, setIceStatus] = useState<IceStatus>('new');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('talkspot_friends', JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem('talkspot_records', JSON.stringify(records));
  }, [records]);

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

  const addRecord = (targetId: string) => {
    const newRecord: CallRecord = {
      id: Math.random().toString(36).substr(2, 9),
      targetId,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    setRecords(prev => [newRecord, ...prev].slice(0, 20));
  };

  const handleAddFriend = (handle: string, name: string) => {
    if (friends.some(f => f.handle === handle)) return;
    const newFriend: Contact = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      handle,
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase(),
      status: 'offline'
    };
    setFriends(prev => [...prev, newFriend]);
  };

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
      
      if (channelRef.current) channelRef.current.close();
      channelRef.current = new BroadcastChannel(`talkspot_${id}`);
      
      const pc = await initWebRTC(id);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

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
            addRecord(id);
            break;
          case 'answer':
            await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
            setStatus(CallStatus.IN_CALL);
            addRecord(id);
            break;
          case 'candidate':
            await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
            break;
          case 'hangup':
            cleanup();
            break;
        }
      };

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
    localStorage.removeItem('talkspot_friends');
    localStorage.removeItem('talkspot_records');
    setProfile(null);
    cleanup();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#020204]">
      {status === CallStatus.IDLE && profile && (
        <Header status={status} onLogout={handleLogout} />
      )}
      <main className="flex-1 relative flex items-center justify-center">
        {!profile ? (
          <ProfileSetup onComplete={setProfile} />
        ) : (status === CallStatus.IDLE || status === CallStatus.ERROR ? (
          <RoomSetup 
            onJoin={handleJoinRoom} 
            error={error} 
            profile={profile} 
            friends={friends}
            records={records}
            onAddFriend={handleAddFriend}
          />
        ) : (
          <CallContainer 
            localStream={localStream}
            remoteStream={remoteStream}
            onHangup={handleHangup}
            status={status}
            roomId={roomId}
            iceStatus={iceStatus}
            profile={profile}
          />
        ))}
      </main>
      {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
    </div>
  );
};

export default App;
