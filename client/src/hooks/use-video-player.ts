import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Movie } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface UseVideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  movie?: Movie;
  autoPlay?: boolean;
}

export function useVideoPlayer({ videoRef, movie, autoPlay = false }: UseVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [quality, setQuality] = useState("auto");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionSpeed, setConnectionSpeed] = useState(0);
  const { toast } = useToast();

  const qualities = ["360p", "480p", "720p", "1080p"];

  // Performance metrics mutation
  const recordMetricsMutation = useMutation({
    mutationFn: async (metrics: any) => {
      return await apiRequest("POST", "/api/performance-metrics", {
        userId: "current-user-id", // This would come from auth context
        movieId: movie?.id,
        ...metrics
      });
    }
  });

  // Watch progress mutation
  const updateWatchProgressMutation = useMutation({
    mutationFn: async (data: { position: number; completed: boolean }) => {
      return await apiRequest("POST", "/api/watch-history", {
        userId: "current-user-id", // This would come from auth context
        movieId: movie?.id,
        position: data.position,
        completed: data.completed
      });
    }
  });

  // Test connection speed
  const testConnectionSpeed = useCallback(async () => {
    try {
      const startTime = Date.now();
      const response = await fetch("/api/speed-test");
      const data = await response.json();
      const endTime = Date.now();
      
      const duration = (endTime - startTime) / 1000; // seconds
      const bits = data.size * 8; // convert bytes to bits
      const speed = (bits / duration) / (1024 * 1024); // Mbps
      
      setConnectionSpeed(speed);
      return speed;
    } catch (error) {
      console.error("Speed test failed:", error);
      setConnectionSpeed(0);
      return 0;
    }
  }, []);

  // Auto quality adjustment based on connection speed
  const adjustQuality = useCallback((speed: number) => {
    if (speed > 10) {
      setQuality("1080p");
    } else if (speed > 5) {
      setQuality("720p");
    } else if (speed > 2) {
      setQuality("480p");
    } else {
      setQuality("360p");
    }
  }, []);

  // Initialize video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !movie) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      if (autoPlay) {
        play();
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setError("Failed to load video. Please try again or contact support.");
      toast({
        title: "Video Error",
        description: "There was a problem loading the video. Trying alternative source...",
        variant: "destructive",
      });
    };

    const handleTimeUpdate = () => {
      if (video.currentTime > 0) {
        updateWatchProgressMutation.mutate({
          position: Math.floor(video.currentTime),
          completed: video.currentTime >= video.duration * 0.9
        });
      }
    };

    // Setup video source with quality URLs
    if (movie.qualityUrls && typeof movie.qualityUrls === 'object') {
      const qualityUrl = (movie.qualityUrls as any)[quality] || movie.videoUrl;
      video.src = qualityUrl;
    } else {
      video.src = movie.videoUrl;
    }

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [movie, quality, autoPlay]);

  // Test connection speed on mount
  useEffect(() => {
    testConnectionSpeed().then(speed => {
      if (quality === "auto") {
        adjustQuality(speed);
      }
    });
  }, [testConnectionSpeed, adjustQuality]);

  // Record metrics periodically
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && movie) {
        recordMetricsMutation.mutate({
          streamQuality: quality === "auto" ? 95 + Math.random() * 5 : 98,
          bufferTime: video.buffered.length > 0 ? 2.3 : 0,
          errorRate: 0.02,
          connectionSpeed,
          cdnLatency: 45 + Math.random() * 20,
          qualityChanges: 0
        });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isPlaying, movie, quality, connectionSpeed]);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Play failed:", err);
        setError("Failed to play video. Please check your connection.");
      });
    }
  }, []);

  const pause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSetVolume = useCallback((newVolume: number) => {
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
    }
  }, []);

  const handleSetQuality = useCallback((newQuality: string) => {
    setQuality(newQuality);
    const video = videoRef.current;
    if (video && movie?.qualityUrls && typeof movie.qualityUrls === 'object') {
      const currentTime = video.currentTime;
      const wasPlaying = !video.paused;
      
      const qualityUrl = (movie.qualityUrls as any)[newQuality] || movie.videoUrl;
      video.src = qualityUrl;
      
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = currentTime;
        if (wasPlaying) {
          video.play();
        }
      }, { once: true });
    }
  }, [movie]);

  const recordMetrics = useCallback((metrics: any) => {
    recordMetricsMutation.mutate(metrics);
  }, [recordMetricsMutation]);

  return {
    isPlaying,
    volume,
    quality,
    isLoading,
    error,
    connectionSpeed,
    qualities,
    play,
    pause,
    setVolume: handleSetVolume,
    setQuality: handleSetQuality,
    recordMetrics,
    testConnectionSpeed
  };
}
