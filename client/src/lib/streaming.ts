export interface StreamingQuality {
  label: string;
  value: string;
  bitrate: number;
  resolution: string;
}

export const STREAMING_QUALITIES: StreamingQuality[] = [
  { label: "Auto", value: "auto", bitrate: 0, resolution: "Auto" },
  { label: "1080p HD", value: "1080p", bitrate: 5000, resolution: "1920x1080" },
  { label: "720p", value: "720p", bitrate: 2500, resolution: "1280x720" },
  { label: "480p", value: "480p", bitrate: 1000, resolution: "854x480" },
  { label: "360p", value: "360p", bitrate: 600, resolution: "640x360" },
];

export class AdaptiveStreamingManager {
  private video: HTMLVideoElement;
  private connectionSpeed: number = 0;
  private currentQuality: string = "auto";
  private qualityUrls: Record<string, string> = {};

  constructor(video: HTMLVideoElement, qualityUrls: Record<string, string>) {
    this.video = video;
    this.qualityUrls = qualityUrls;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Monitor buffering events
    this.video.addEventListener('waiting', this.handleBuffering.bind(this));
    this.video.addEventListener('canplay', this.handleCanPlay.bind(this));
    
    // Monitor playback quality
    this.video.addEventListener('progress', this.handleProgress.bind(this));
  }

  private handleBuffering() {
    // If buffering frequently, reduce quality
    if (this.currentQuality !== "360p") {
      this.reduceQuality();
    }
  }

  private handleCanPlay() {
    // Video can play smoothly, maybe increase quality if connection allows
    if (this.connectionSpeed > 10 && this.currentQuality !== "1080p") {
      this.increaseQuality();
    }
  }

  private handleProgress() {
    // Check buffer health
    if (this.video.buffered.length > 0) {
      const bufferEnd = this.video.buffered.end(this.video.buffered.length - 1);
      const bufferHealth = bufferEnd - this.video.currentTime;
      
      // If buffer is low, reduce quality
      if (bufferHealth < 5 && this.currentQuality !== "360p") {
        this.reduceQuality();
      }
    }
  }

  public updateConnectionSpeed(speed: number) {
    this.connectionSpeed = speed;
    if (this.currentQuality === "auto") {
      this.autoSelectQuality();
    }
  }

  private autoSelectQuality() {
    let targetQuality = "360p";
    
    if (this.connectionSpeed > 10) {
      targetQuality = "1080p";
    } else if (this.connectionSpeed > 5) {
      targetQuality = "720p";
    } else if (this.connectionSpeed > 2) {
      targetQuality = "480p";
    }

    if (targetQuality !== this.currentQuality) {
      this.switchQuality(targetQuality);
    }
  }

  private reduceQuality() {
    const qualities = ["1080p", "720p", "480p", "360p"];
    const currentIndex = qualities.indexOf(this.currentQuality);
    if (currentIndex < qualities.length - 1) {
      this.switchQuality(qualities[currentIndex + 1]);
    }
  }

  private increaseQuality() {
    const qualities = ["360p", "480p", "720p", "1080p"];
    const currentIndex = qualities.indexOf(this.currentQuality);
    if (currentIndex < qualities.length - 1) {
      this.switchQuality(qualities[currentIndex + 1]);
    }
  }

  public switchQuality(quality: string) {
    if (!this.qualityUrls[quality] || quality === this.currentQuality) return;

    const currentTime = this.video.currentTime;
    const wasPlaying = !this.video.paused;
    
    this.video.src = this.qualityUrls[quality];
    this.currentQuality = quality;

    this.video.addEventListener('loadedmetadata', () => {
      this.video.currentTime = currentTime;
      if (wasPlaying) {
        this.video.play();
      }
    }, { once: true });
  }

  public getCurrentQuality(): string {
    return this.currentQuality;
  }

  public getAvailableQualities(): string[] {
    return Object.keys(this.qualityUrls);
  }
}

export function createHLSUrl(baseUrl: string, quality: string): string {
  // This would integrate with your HLS streaming setup
  return `${baseUrl}/${quality}/playlist.m3u8`;
}

export function detectOptimalQuality(connectionSpeed: number, screenWidth: number): string {
  // Factor in both connection speed and screen size
  if (connectionSpeed < 2) return "360p";
  if (connectionSpeed < 5) return "480p";
  
  if (screenWidth < 720) return "480p";
  if (screenWidth < 1280) return "720p";
  
  return connectionSpeed > 10 ? "1080p" : "720p";
}

export function calculateBandwidthRequirement(quality: string): number {
  const requirements: Record<string, number> = {
    "360p": 0.6,
    "480p": 1.0,
    "720p": 2.5,
    "1080p": 5.0
  };
  
  return requirements[quality] || 1.0;
}
