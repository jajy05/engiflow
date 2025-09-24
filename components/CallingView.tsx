import React, { useState, useEffect, useRef } from 'react';
import type { ActiveCall } from '../types';
import { PhoneHangupIcon } from './icons/PhoneHangupIcon';

interface CallingViewProps {
  activeCall: ActiveCall;
  onEndCall: () => void;
}

export const CallingView: React.FC<CallingViewProps> = ({ activeCall, onEndCall }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const { user } = activeCall;

  useEffect(() => {
    const getMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        // Handle error - maybe show a message and end the call
        alert("Could not access camera and microphone. Please check permissions.");
        onEndCall();
      }
    };

    getMedia();

    // Cleanup function to stop media tracks when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Only run once on mount

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-90 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <img 
          src={user.photoUrl || `https://i.pravatar.cc/150?u=${user.email}`} 
          alt={user.name} 
          className="w-full h-full object-cover opacity-10 blur-xl scale-110" 
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full w-full">
        {/* Local video preview */}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="absolute top-4 right-4 w-24 md:w-40 h-auto rounded-lg shadow-2xl border-2 border-white/20 object-cover"
        ></video>
        
        {/* Recipient info */}
        <div className="flex-grow flex flex-col items-center justify-center">
            <img 
                src={user.photoUrl || `https://i.pravatar.cc/150?u=${user.email}`} 
                alt={user.name} 
                className="w-40 h-40 rounded-full object-cover mb-6 ring-4 ring-white/30 shadow-2xl" 
            />
            <h1 className="text-4xl font-bold">{user.name}</h1>
            <p className="text-lg mt-2 text-gray-300 animate-pulse">Calling...</p>
        </div>

        {/* Call controls */}
        <div className="mb-12">
          <button
            onClick={onEndCall}
            className="flex flex-col items-center justify-center w-20 h-20 bg-red-600 rounded-full hover:bg-red-700 transition-colors shadow-lg"
            aria-label="End call"
          >
            <PhoneHangupIcon className="w-10 h-10" />
          </button>
        </div>
      </div>
    </div>
  );
};