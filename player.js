/**
 * Advanced Video Player with Bunny CDN Integration
 * Handles video playback, error management, and debugging
 */

class VideoPlayer {
    constructor(videoElement, options = {}) {
        this.video = videoElement;
        this.container = options.container || videoElement.parentElement;
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorOverlay = document.getElementById('errorOverlay');
        
        // Player state
        this.currentSource = '';
        this.isLoading = false;
        this.hasError = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // Configuration
        this.options = {
            autoplay: options.autoplay || false,
            preload: options.preload || 'metadata',
            crossOrigin: options.crossOrigin || 'anonymous',
            ...options
        };

        this.initializePlayer();
        this.setupEventListeners();
        
        // Initialize debug monitoring
        this.setupDebugMonitoring();
        
        this.log('info', 'Video player initialized', this.options);
    }

    /**
     * Initialize player with default settings
     */
    initializePlayer() {
        // Set initial video attributes
        this.video.crossOrigin = this.options.crossOrigin;
        this.video.preload = this.options.preload;
        
        // Configure for better streaming
        this.video.setAttribute('playsinline', '');
        this.video.setAttribute('webkit-playsinline', '');
        
        // Set initial loading state
        this.setLoadingState(false);
        this.setErrorState(false);
    }

    /**
     * Setup all video event listeners
     */
    setupEventListeners() {
        // Loading events
        this.video.addEventListener('loadstart', () => {
            this.log('info', 'Video load started');
            this.setLoadingState(true);
            this.setErrorState(false);
            this.updatePlayerStatus('loading');
        });

        this.video.addEventListener('loadedmetadata', () => {
            this.log('info', 'Video metadata loaded', {
                duration: this.video.duration,
                videoWidth: this.video.videoWidth,
                videoHeight: this.video.videoHeight
            });
            this.updatePlayerStatus('metadata-loaded');
        });

        this.video.addEventListener('loadeddata', () => {
            this.log('info', 'Video data loaded');
            this.updatePlayerStatus('data-loaded');
        });

        this.video.addEventListener('canplay', () => {
            this.log('info', 'Video can start playing');
            this.setLoadingState(false);
            this.updatePlayerStatus('can-play');
        });

        this.video.addEventListener('canplaythrough', () => {
            this.log('info', 'Video can play through without buffering');
            this.updatePlayerStatus('can-play-through');
        });

        // Playback events
        this.video.addEventListener('play', () => {
            this.log('info', 'Video play started');
            this.updatePlayerStatus('playing');
        });

        this.video.addEventListener('pause', () => {
            this.log('info', 'Video paused');
            this.updatePlayerStatus('paused');
        });

        this.video.addEventListener('ended', () => {
            this.log('info', 'Video playback ended');
            this.updatePlayerStatus('ended');
        });

        // Progress events
        this.video.addEventListener('progress', () => {
            this.logBufferedRanges();
        });

        this.video.addEventListener('timeupdate', () => {
            // Throttled logging to avoid spam
            if (Math.floor(this.video.currentTime) % 10 === 0) {
                this.updatePlaybackInfo();
            }
        });

        // Network events
        this.video.addEventListener('waiting', () => {
            this.log('warn', 'Video is waiting for more data');
            this.setLoadingState(true);
            this.updatePlayerStatus('buffering');
        });

        this.video.addEventListener('stalled', () => {
            this.log('warn', 'Video download has stalled');
            this.updatePlayerStatus('stalled');
        });

        this.video.addEventListener('suspend', () => {
            this.log('info', 'Video loading suspended');
            this.updatePlayerStatus('suspended');
        });

        // Error events
        this.video.addEventListener('error', (event) => {
            this.handleVideoError(event);
        });

        this.video.addEventListener('abort', () => {
            this.log('warn', 'Video loading aborted');
            this.updatePlayerStatus('aborted');
        });

        // Setup retry button
        const retryButton = document.getElementById('retryButton');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                this.retryPlayback();
            });
        }
    }

    /**
     * Load video from source
     */
    async loadVideo(source, metadata = {}) {
        this.log('info', 'Loading video', { source, metadata });
        
        // Reset state
        this.hasError = false;
        this.retryCount = 0;
        
        // Construct full URL using Bunny CDN
        const videoUrl = window.bunnyCDN.constructVideoUrl(source);
        
        if (!videoUrl) {
            this.handleVideoError(null, 'Invalid video source or CDN configuration');
            return false;
        }

        this.currentSource = videoUrl;
        
        try {
            // Test CDN connection first
            this.setLoadingState(true);
            const connectionTest = await window.bunnyCDN.testConnection(videoUrl);
            
            if (!connectionTest.success) {
                throw new Error(`CDN connection failed: ${connectionTest.error}`);
            }

            // Update video info if metadata provided
            this.updateVideoInfo(metadata);

            // Set video source with optimized URL
            const optimizedUrl = window.bunnyCDN.getOptimizedUrl(source, {
                quality: 'auto',
                format: 'auto'
            });

            this.video.src = optimizedUrl || videoUrl;
            this.video.load();

            this.log('info', 'Video source set', {
                originalSource: source,
                finalUrl: this.video.src
            });

            // Update debug info
            this.updateDebugInfo();
            
            return true;

        } catch (error) {
            this.log('error', 'Failed to load video', error.message);
            this.handleVideoError(null, error.message);
            return false;
        }
    }

    /**
     * Handle video errors
     */
    handleVideoError(event, customMessage = null) {
        this.hasError = true;
        this.setLoadingState(false);

        let errorMessage = customMessage;
        let errorCode = null;
        let errorDetails = {};

        if (event && this.video.error) {
            errorCode = this.video.error.code;
            
            // Decode HTML5 video error codes
            const errorMessages = {
                1: 'MEDIA_ERR_ABORTED: The video download was aborted',
                2: 'MEDIA_ERR_NETWORK: A network error occurred while downloading',
                3: 'MEDIA_ERR_DECODE: An error occurred while decoding the video',
                4: 'MEDIA_ERR_SRC_NOT_SUPPORTED: The video format is not supported'
            };

            errorMessage = errorMessages[errorCode] || 'Unknown video error';
            
            errorDetails = {
                code: errorCode,
                message: errorMessage,
                currentSource: this.currentSource,
                networkState: this.video.networkState,
                readyState: this.video.readyState
            };
        }

        this.log('error', 'Video playback error', errorDetails);
        this.showError(errorMessage, errorDetails);
        this.updatePlayerStatus('error');
    }

    /**
     * Show error overlay
     */
    showError(message, details = {}) {
        const errorMessageEl = document.getElementById('errorMessage');
        const errorDetailsEl = document.getElementById('errorDetails');
        
        if (errorMessageEl) {
            errorMessageEl.textContent = message;
        }
        
        if (errorDetailsEl && Object.keys(details).length > 0) {
            errorDetailsEl.innerHTML = `
                <strong>Technical Details:</strong><br>
                ${Object.entries(details).map(([key, value]) => 
                    `<div>${key}: ${value}</div>`
                ).join('')}
            `;
        }

        this.setErrorState(true);
    }

    /**
     * Retry video playback
     */
    async retryPlayback() {
        if (this.retryCount >= this.maxRetries) {
            this.log('error', 'Maximum retry attempts reached');
            this.showError('Maximum retry attempts reached. Please check your connection and try again later.');
            return;
        }

        this.retryCount++;
        this.log('info', `Retrying playback (attempt ${this.retryCount}/${this.maxRetries})`);
        
        this.setErrorState(false);
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
        
        // Reload the same source
        if (this.currentSource) {
            const source = this.currentSource.split('/').pop(); // Get filename
            await this.loadVideo(source);
        }
    }

    /**
     * Set loading state
     */
    setLoadingState(loading) {
        this.isLoading = loading;
        
        if (this.loadingOverlay) {
            if (loading) {
                this.loadingOverlay.classList.remove('hidden');
                this.loadingOverlay.style.display = 'flex';
            } else {
                this.loadingOverlay.classList.add('hidden');
                setTimeout(() => {
                    this.loadingOverlay.style.display = 'none';
                }, 300);
            }
        }
    }

    /**
     * Set error state
     */
    setErrorState(error) {
        this.hasError = error;
        
        if (this.errorOverlay) {
            this.errorOverlay.style.display = error ? 'flex' : 'none';
        }
    }

    /**
     * Update video information display
     */
    updateVideoInfo(metadata) {
        const videoInfo = document.getElementById('videoInfo');
        const videoTitle = document.getElementById('videoTitle');
        const videoDescription = document.getElementById('videoDescription');

        if (metadata.title && videoTitle) {
            videoTitle.textContent = metadata.title;
        }

        if (metadata.description && videoDescription) {
            videoDescription.textContent = metadata.description;
        }

        if (videoInfo && (metadata.title || metadata.description)) {
            videoInfo.style.display = 'block';
        }
    }

    /**
     * Update player status in debug panel
     */
    updatePlayerStatus(status) {
        if (window.debugPanel && typeof window.debugPanel.updatePlayerStatus === 'function') {
            window.debugPanel.updatePlayerStatus({
                currentSource: this.currentSource,
                videoState: status,
                networkState: this.getNetworkStateText(),
                readyState: this.getReadyStateText(),
                buffered: this.getBufferedRanges()
            });
        }

        // Update connection status indicator
        const playerStatusText = document.getElementById('playerStatusText');
        const playerStatusIndicator = document.getElementById('playerStatusIndicator');
        
        if (playerStatusText) {
            playerStatusText.textContent = status;
        }
        
        if (playerStatusIndicator) {
            playerStatusIndicator.className = 'status-dot ' + 
                (status === 'error' ? 'status-error' : 
                 status === 'playing' || status === 'can-play' ? 'status-success' : 
                 'status-warning');
        }
    }

    /**
     * Get human-readable network state
     */
    getNetworkStateText() {
        const states = ['EMPTY', 'IDLE', 'LOADING', 'NO_SOURCE'];
        return states[this.video.networkState] || 'UNKNOWN';
    }

    /**
     * Get human-readable ready state
     */
    getReadyStateText() {
        const states = ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'];
        return states[this.video.readyState] || 'UNKNOWN';
    }

    /**
     * Get buffered ranges information
     */
    getBufferedRanges() {
        const buffered = this.video.buffered;
        const ranges = [];
        
        for (let i = 0; i < buffered.length; i++) {
            ranges.push({
                start: buffered.start(i),
                end: buffered.end(i)
            });
        }
        
        return ranges;
    }

    /**
     * Log buffered ranges (throttled)
     */
    logBufferedRanges() {
        if (!this._lastBufferLog || Date.now() - this._lastBufferLog > 5000) {
            this._lastBufferLog = Date.now();
            this.log('info', 'Buffer ranges', this.getBufferedRanges());
        }
    }

    /**
     * Update playback information
     */
    updatePlaybackInfo() {
        if (!this._lastPlaybackLog || Date.now() - this._lastPlaybackLog > 10000) {
            this._lastPlaybackLog = Date.now();
            this.log('info', 'Playback info', {
                currentTime: this.video.currentTime,
                duration: this.video.duration,
                playbackRate: this.video.playbackRate,
                volume: this.video.volume
            });
        }
    }

    /**
     * Setup debug monitoring
     */
    setupDebugMonitoring() {
        // Monitor network state changes
        let lastNetworkState = this.video.networkState;
        let lastReadyState = this.video.readyState;

        const checkStateChanges = () => {
            if (this.video.networkState !== lastNetworkState) {
                this.log('info', 'Network state changed', {
                    from: lastNetworkState,
                    to: this.video.networkState,
                    text: this.getNetworkStateText()
                });
                lastNetworkState = this.video.networkState;
            }

            if (this.video.readyState !== lastReadyState) {
                this.log('info', 'Ready state changed', {
                    from: lastReadyState,
                    to: this.video.readyState,
                    text: this.getReadyStateText()
                });
                lastReadyState = this.video.readyState;
            }

            requestAnimationFrame(checkStateChanges);
        };

        checkStateChanges();
    }

    /**
     * Update debug information
     */
    updateDebugInfo() {
        if (window.debugPanel && typeof window.debugPanel.updatePlayerStatus === 'function') {
            window.debugPanel.updatePlayerStatus({
                currentSource: this.currentSource,
                videoState: this.hasError ? 'error' : this.isLoading ? 'loading' : 'ready',
                networkState: this.getNetworkStateText(),
                readyState: this.getReadyStateText()
            });
        }
    }

    /**
     * Logging utility
     */
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            module: 'VideoPlayer',
            message,
            data
        };

        // Console logging
        const consoleMethod = console[level] || console.log;
        if (data) {
            consoleMethod(`[${timestamp}] [VideoPlayer] ${message}`, data);
        } else {
            consoleMethod(`[${timestamp}] [VideoPlayer] ${message}`);
        }

        // Send to debug panel if available
        if (window.debugPanel && typeof window.debugPanel.addLog === 'function') {
            window.debugPanel.addLog(logEntry);
        }
    }

    /**
     * Get current player state
     */
    getState() {
        return {
            currentSource: this.currentSource,
            isLoading: this.isLoading,
            hasError: this.hasError,
            isPaused: this.video.paused,
            currentTime: this.video.currentTime,
            duration: this.video.duration,
            networkState: this.video.networkState,
            readyState: this.video.readyState,
            buffered: this.getBufferedRanges()
        };
    }
}

// Export for global use
window.VideoPlayer = VideoPlayer;
