import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoiceAudioPlayerProps {
  audioUrl: string;
  duration?: number;
  isMine?: boolean;
}

export const VoiceAudioPlayer: React.FC<VoiceAudioPlayerProps> = ({
  audioUrl,
  duration = 0,
  isMine = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const seekTo = parseFloat(e.target.value);
    audio.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div
      className={`flex items-center gap-2.5 p-2 rounded-xl transition-colors ${
        isMine ? 'bg-white/15 text-white' : 'bg-white border border-[#dadce0] text-[#1a1b1e]'
      }`}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition-transform active:scale-95 ${
          isMine
            ? 'bg-white text-[#1a73e8] hover:bg-white/90'
            : 'bg-[#1a73e8] text-white hover:bg-[#1557b0]'
        }`}
        title={isPlaying ? 'Pause voice message' : 'Play voice message'}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
      </button>

      {/* Track & waveform visualization */}
      <div className="flex-1 flex flex-col justify-center min-w-[120px]">
        {/* Animated mini sound bars */}
        <div className="flex items-center gap-0.75 h-4 mb-1">
          {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65, 90, 40].map((h, i) => {
            const barProgress = (i / 14) * 100;
            const isPassed = barProgress <= progressPercent;
            return (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isMine
                    ? isPassed
                      ? 'bg-white'
                      : 'bg-white/40'
                    : isPassed
                    ? 'bg-[#1a73e8]'
                    : 'bg-[#c4c7c5]'
                } ${isPlaying ? 'animate-pulse' : ''}`}
              />
            );
          })}
        </div>

        {/* Progress slider */}
        <input
          type="range"
          min="0"
          max={audioDuration || 1}
          step="0.05"
          value={currentTime}
          onChange={handleSeek}
          className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-current ${
            isMine ? 'accent-white bg-white/30' : 'accent-[#1a73e8] bg-[#e3e2e6]'
          }`}
        />

        <div className="flex items-center justify-between text-[10px] font-mono mt-1 opacity-80">
          <span>{formatSeconds(currentTime)}</span>
          <span className="flex items-center gap-0.5">
            <Volume2 className="w-2.5 h-2.5 opacity-60" />
            <span>{formatSeconds(audioDuration || duration)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
