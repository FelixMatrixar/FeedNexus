import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IconPlay, IconPause, IconStop } from './icons/SlideIcons';

interface AudioPlayerProps {
  text: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setIsPlaying(false);
    };
    utteranceRef.current = utterance;

    // Cleanup on component unmount or text change
    return () => {
      handleStop();
    };
  }, [text, handleStop]);

  const handlePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        if(utteranceRef.current) {
            window.speechSynthesis.speak(utteranceRef.current);
        }
      }
      setIsPlaying(true);
    }
  };
  
  return (
    <div className="bg-[#333333] p-4 rounded-xl shadow-lg w-full max-w-3xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-bold text-gray-200">Story Summary Audio</h3>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handlePlayPause}
          className="p-2 rounded-full bg-[#BB86FC] text-[#121212] hover:bg-[#a16bea] transition-colors"
          aria-label={isPlaying ? 'Pause summary' : 'Play summary'}
        >
          {isPlaying ? <IconPause className="w-6 h-6" /> : <IconPlay className="w-6 h-6" />}
        </button>
        <button
          onClick={handleStop}
          className="p-2 rounded-full text-gray-300 hover:bg-gray-600/50 transition-colors"
          aria-label="Stop summary"
        >
          <IconStop className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};