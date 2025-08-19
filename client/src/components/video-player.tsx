import { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Settings, Maximize } from "lucide-react";
import { useVideoPlayer } from "@/hooks/use-video-player";
import type { Movie } from "@shared/schema";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  movie?: Movie;
  autoPlay?: boolean;
  className?: string;
}

export function VideoPlayer({ movie, autoPlay = false, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const {
    isPlaying,
    volume,
    quality,
    isLoading,
    error,
    connectionSpeed,
    play,
    pause,
    setVolume,
    setQuality,
    recordMetrics,
    qualities
  } = useVideoPlayer({
    videoRef,
    movie,
    autoPlay
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = parseFloat(e.target.value);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (video && document.fullscreenElement !== video) {
      video.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  if (error) {
    return (
      <div className={cn("aspect-video bg-black rounded-lg flex items-center justify-center", className)}>
        <div className="text-center p-8">
          <div className="text-red-500 text-xl mb-4" data-testid="video-error-icon">⚠️</div>
          <h3 className="text-xl font-semibold mb-2" data-testid="text-video-error">
            Playback Error
          </h3>
          <p className="text-gray-400 mb-4" data-testid="text-error-description">
            {error}
          </p>
          <button 
            className="madifa-button-primary px-6 py-2 rounded-lg"
            onClick={() => window.location.reload()}
            data-testid="button-retry-video"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("relative video-player group", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      data-testid="video-player-container"
    >
      <video
        ref={videoRef}
        className="w-full aspect-video object-cover"
        poster={movie?.thumbnailUrl || undefined}
        data-testid="video-element"
      >
        {movie?.videoUrl && <source src={movie.videoUrl} type="video/mp4" />}
        Your browser does not support the video tag.
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-madifa-orange mb-4"></div>
            <p className="text-white" data-testid="text-loading-video">Loading video...</p>
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group">
          <button 
            className="w-20 h-20 bg-madifa-purple/80 hover:bg-madifa-purple rounded-full flex items-center justify-center transform transition-all duration-300 group-hover:scale-110"
            onClick={isPlaying ? pause : play}
            data-testid="button-play-overlay"
          >
            <Play className="text-white text-2xl ml-1" />
          </button>
        </div>
      )}

      {/* Quality Selector */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/80 rounded-lg p-2 backdrop-blur-sm">
          <select 
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="bg-transparent text-white text-sm outline-none cursor-pointer"
            data-testid="select-video-quality"
          >
            <option value="auto">Auto ({quality})</option>
            {qualities.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Connection Info */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/80 rounded-lg p-2 backdrop-blur-sm">
        <div className={cn(
          "w-3 h-3 rounded-full animate-pulse",
          connectionSpeed > 10 ? "bg-green-500" : 
          connectionSpeed > 5 ? "bg-yellow-500" : "bg-red-500"
        )}></div>
        <span className="text-white text-sm" data-testid="text-connection-speed">
          {connectionSpeed > 0 ? `${connectionSpeed.toFixed(1)} Mbps` : 'Detecting...'}
        </span>
      </div>

      {/* Video Controls */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-transform duration-300",
        showControls || !isPlaying ? "translate-y-0" : "translate-y-full"
      )}>
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--madifa-orange) 0%, var(--madifa-orange) ${(currentTime / duration) * 100}%, rgb(75, 85, 99) ${(currentTime / duration) * 100}%, rgb(75, 85, 99) 100%)`
            }}
            data-testid="video-progress-bar"
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span data-testid="text-current-time">{formatTime(currentTime)}</span>
            <span data-testid="text-duration">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={isPlaying ? pause : play}
              className="text-white hover:text-madifa-orange transition-colors"
              data-testid="button-play-pause"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setVolume(volume > 0 ? 0 : 1)}
                className="text-white hover:text-madifa-orange transition-colors"
                data-testid="button-volume"
              >
                {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                data-testid="volume-slider"
              />
            </div>

            <span className="text-sm text-gray-300" data-testid="text-movie-title-overlay">
              {movie?.title}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              className="text-white hover:text-madifa-orange transition-colors"
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-madifa-orange transition-colors"
              data-testid="button-fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
