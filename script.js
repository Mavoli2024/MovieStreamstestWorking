/**
 * Main Application Script
 * Coordinates all components and handles user interactions
 */

class StreamingApp {
    constructor() {
        this.moviePlayer = null;
        this.currentMovie = null;
        
        this.initialize();
        this.log('info', 'Streaming application initialized');
    }

    /**
     * Initialize the application
     */
    async initialize() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    /**
     * Initialize all components
     */
    initializeComponents() {
        try {
            // Initialize Feather icons
            if (typeof feather !== 'undefined') {
                feather.replace();
            }

            // Initialize video player
            this.initializeVideoPlayer();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial configuration
            this.loadInitialConfiguration();
            
            this.log('info', 'All components initialized successfully');
            
        } catch (error) {
            this.log('error', 'Failed to initialize components', error.message);
            this.showGlobalError('Failed to initialize application', error);
        }
    }

    /**
     * Initialize the video player
     */
    initializeVideoPlayer() {
        const videoElement = document.getElementById('moviePlayer');
        
        if (!videoElement) {
            throw new Error('Video element not found');
        }

        this.moviePlayer = new VideoPlayer(videoElement, {
            autoplay: false,
            preload: 'metadata',
            crossOrigin: 'anonymous'
        });

        // Make player globally available
        window.moviePlayer = this.moviePlayer;
        
        this.log('info', 'Video player initialized');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // CDN Configuration
        const updateCdnButton = document.getElementById('updateCdnConfig');
        if (updateCdnButton) {
            updateCdnButton.addEventListener('click', () => {
                this.updateCdnConfiguration();
            });
        }

        // Custom video loading
        const loadCustomVideoButton = document.getElementById('loadCustomVideo');
        if (loadCustomVideoButton) {
            loadCustomVideoButton.addEventListener('click', () => {
                this.loadCustomVideo();
            });
        }

        // Movie selection from list
        const movieItems = document.querySelectorAll('.movie-item');
        movieItems.forEach(item => {
            item.addEventListener('click', () => {
                this.selectMovie(item);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });

        // CDN input fields - Enter key support
        const cdnInputs = ['cdnBaseUrl', 'cdnToken', 'customVideoUrl'];
        cdnInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        if (inputId === 'customVideoUrl') {
                            this.loadCustomVideo();
                        } else {
                            this.updateCdnConfiguration();
                        }
                    }
                });
            }
        });

        this.log('info', 'Event listeners setup completed');
    }

    /**
     * Load initial configuration
     */
    loadInitialConfiguration() {
        // Load CDN configuration into UI
        const cdnBaseUrlInput = document.getElementById('cdnBaseUrl');
        const cdnTokenInput = document.getElementById('cdnToken');

        if (window.bunnyCDN) {
            if (cdnBaseUrlInput && window.bunnyCDN.baseUrl) {
                cdnBaseUrlInput.value = window.bunnyCDN.baseUrl;
            }
            
            if (cdnTokenInput && window.bunnyCDN.token) {
                cdnTokenInput.value = window.bunnyCDN.token;
            }
        }

        // Test initial CDN connection if configured
        if (window.bunnyCDN && window.bunnyCDN.isConfigured) {
            setTimeout(() => {
                this.testCdnConnection();
            }, 1000);
        }

        this.log('info', 'Initial configuration loaded');
    }

    /**
     * Update CDN configuration
     */
    updateCdnConfiguration() {
        const baseUrlInput = document.getElementById('cdnBaseUrl');
        const tokenInput = document.getElementById('cdnToken');

        if (!baseUrlInput) {
            this.log('error', 'CDN base URL input not found');
            return;
        }

        const baseUrl = baseUrlInput.value.trim();
        const token = tokenInput ? tokenInput.value.trim() : '';

        if (!baseUrl) {
            this.showTemporaryMessage('Please enter a valid CDN base URL', 'warning');
            return;
        }

        // Validate URL format
        try {
            new URL(baseUrl);
        } catch (e) {
            this.showTemporaryMessage('Please enter a valid URL format', 'error');
            return;
        }

        // Update CDN configuration
        const success = window.bunnyCDN.updateConfiguration({
            baseUrl: baseUrl,
            token: token
        });

        if (success) {
            this.showTemporaryMessage('CDN configuration updated successfully', 'success');
            
            // Test connection
            setTimeout(() => {
                this.testCdnConnection();
            }, 500);
            
        } else {
            this.showTemporaryMessage('Failed to update CDN configuration', 'error');
        }

        this.log('info', 'CDN configuration updated', { baseUrl, hasToken: !!token });
    }

    /**
     * Test CDN connection
     */
    async testCdnConnection() {
        if (!window.bunnyCDN || !window.bunnyCDN.isConfigured) {
            this.log('warn', 'Cannot test CDN connection - not configured');
            return;
        }

        this.log('info', 'Testing CDN connection...');
        
        try {
            const result = await window.bunnyCDN.testConnection();
            
            if (result.success) {
                this.showTemporaryMessage('CDN connection test successful', 'success');
                this.log('info', 'CDN connection test passed', result);
            } else {
                this.showTemporaryMessage(`CDN connection failed: ${result.error}`, 'error');
                this.log('error', 'CDN connection test failed', result);
            }
            
        } catch (error) {
            this.showTemporaryMessage('CDN connection test error', 'error');
            this.log('error', 'CDN connection test error', error.message);
        }
    }

    /**
     * Load custom video
     */
    async loadCustomVideo() {
        const customVideoInput = document.getElementById('customVideoUrl');
        
        if (!customVideoInput) {
            this.log('error', 'Custom video URL input not found');
            return;
        }

        const videoUrl = customVideoInput.value.trim();
        
        if (!videoUrl) {
            this.showTemporaryMessage('Please enter a video URL or filename', 'warning');
            return;
        }

        // Clear current selection
        this.clearMovieSelection();

        // Load the video
        const success = await this.moviePlayer.loadVideo(videoUrl, {
            title: 'Custom Video',
            description: `Loading: ${videoUrl}`
        });

        if (success) {
            this.currentMovie = {
                filename: videoUrl,
                title: 'Custom Video',
                description: `Loaded: ${videoUrl}`
            };
            
            this.showTemporaryMessage('Custom video loaded successfully', 'success');
        } else {
            this.showTemporaryMessage('Failed to load custom video', 'error');
        }

        this.log('info', 'Custom video load attempted', { videoUrl, success });
    }

    /**
     * Select movie from the list
     */
    async selectMovie(movieElement) {
        const filename = movieElement.getAttribute('data-filename');
        const title = movieElement.querySelector('h6')?.textContent || 'Unknown Movie';
        const description = movieElement.querySelector('small')?.textContent || '';

        if (!filename) {
            this.log('error', 'Movie filename not found');
            return;
        }

        // Update UI selection
        this.clearMovieSelection();
        movieElement.classList.add('active');

        // Load the movie
        const success = await this.moviePlayer.loadVideo(filename, {
            title: title,
            description: description
        });

        if (success) {
            this.currentMovie = {
                filename: filename,
                title: title,
                description: description
            };
            
            this.showTemporaryMessage(`Loading: ${title}`, 'info');
        } else {
            movieElement.classList.remove('active');
            this.showTemporaryMessage(`Failed to load: ${title}`, 'error');
        }

        this.log('info', 'Movie selection', { filename, title, success });
    }

    /**
     * Clear movie selection UI
     */
    clearMovieSelection() {
        const movieItems = document.querySelectorAll('.movie-item');
        movieItems.forEach(item => {
            item.classList.remove('active');
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Only handle shortcuts when not typing in inputs
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (event.key) {
            case ' ': // Spacebar - play/pause
                event.preventDefault();
                if (this.moviePlayer && this.moviePlayer.video) {
                    if (this.moviePlayer.video.paused) {
                        this.moviePlayer.video.play();
                    } else {
                        this.moviePlayer.video.pause();
                    }
                }
                break;

            case 'f': // F - toggle fullscreen
            case 'F':
                event.preventDefault();
                this.toggleFullscreen();
                break;

            case 'm': // M - toggle mute
            case 'M':
                event.preventDefault();
                if (this.moviePlayer && this.moviePlayer.video) {
                    this.moviePlayer.video.muted = !this.moviePlayer.video.muted;
                }
                break;

            case 'ArrowLeft': // Left arrow - seek backward
                event.preventDefault();
                if (this.moviePlayer && this.moviePlayer.video) {
                    this.moviePlayer.video.currentTime = Math.max(0, this.moviePlayer.video.currentTime - 10);
                }
                break;

            case 'ArrowRight': // Right arrow - seek forward
                event.preventDefault();
                if (this.moviePlayer && this.moviePlayer.video) {
                    this.moviePlayer.video.currentTime = Math.min(
                        this.moviePlayer.video.duration, 
                        this.moviePlayer.video.currentTime + 10
                    );
                }
                break;

            case 'ArrowUp': // Up arrow - volume up
                event.preventDefault();
                if (this.moviePlayer && this.moviePlayer.video) {
                    this.moviePlayer.video.volume = Math.min(1, this.moviePlayer.video.volume + 0.1);
                }
                break;

            case 'ArrowDown': // Down arrow - volume down
                event.preventDefault();
                if (this.moviePlayer && this.moviePlayer.video) {
                    this.moviePlayer.video.volume = Math.max(0, this.moviePlayer.video.volume - 0.1);
                }
                break;
        }
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!this.moviePlayer || !this.moviePlayer.video) {
            return;
        }

        const video = this.moviePlayer.video;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            video.requestFullscreen().catch(err => {
                this.log('error', 'Failed to enter fullscreen', err.message);
            });
        }
    }

    /**
     * Show temporary message to user
     */
    showTemporaryMessage(message, type = 'info') {
        // Create or update message element
        let messageEl = document.getElementById('tempMessage');
        
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'tempMessage';
            messageEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 6px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                max-width: 400px;
                word-wrap: break-word;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(messageEl);
        }

        // Clear any existing timeout
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }

        // Set message content and style
        messageEl.textContent = message;
        messageEl.className = `alert alert-${type} fade-in`;

        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;
        messageEl.style.color = type === 'warning' ? '#000' : '#fff';

        // Auto-hide after 5 seconds
        this.messageTimeout = setTimeout(() => {
            if (messageEl && messageEl.parentNode) {
                messageEl.style.opacity = '0';
                messageEl.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (messageEl && messageEl.parentNode) {
                        messageEl.parentNode.removeChild(messageEl);
                    }
                }, 300);
            }
        }, 5000);

        this.log('info', 'Temporary message shown', { message, type });
    }

    /**
     * Show global application error
     */
    showGlobalError(message, error) {
        const errorDetails = error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : null;

        // Log the error
        this.log('error', message, errorDetails);

        // Show user-friendly error message
        this.showTemporaryMessage(message, 'error');

        // If debug panel is available, ensure it shows the error
        if (window.debugPanel && typeof window.debugPanel.addLog === 'function') {
            window.debugPanel.addLog({
                timestamp: new Date().toISOString(),
                level: 'error',
                module: 'StreamingApp',
                message: message,
                data: errorDetails
            });
        }
    }

    /**
     * Get application status
     */
    getStatus() {
        return {
            isInitialized: !!this.moviePlayer,
            currentMovie: this.currentMovie,
            playerState: this.moviePlayer ? this.moviePlayer.getState() : null,
            cdnConfigured: window.bunnyCDN ? window.bunnyCDN.isConfigured : false
        };
    }

    /**
     * Logging utility
     */
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            module: 'StreamingApp',
            message,
            data
        };

        // Console logging
        const consoleMethod = console[level] || console.log;
        if (data) {
            consoleMethod(`[${timestamp}] [StreamingApp] ${message}`, data);
        } else {
            consoleMethod(`[${timestamp}] [StreamingApp] ${message}`);
        }

        // Send to debug panel if available
        if (window.debugPanel && typeof window.debugPanel.addLog === 'function') {
            window.debugPanel.addLog(logEntry);
        }
    }
}

// Initialize the application
const streamingApp = new StreamingApp();

// Make app globally available for debugging
window.streamingApp = streamingApp;

// Handle unhandled errors
window.addEventListener('error', (event) => {
    streamingApp.showGlobalError('Unexpected application error', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    streamingApp.showGlobalError('Unhandled promise rejection', event.reason);
});
