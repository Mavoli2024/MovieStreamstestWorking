/**
 * Debug Panel for Movies Streaming App
 * Provides real-time debugging information and logs
 */

class DebugPanel {
    constructor() {
        this.panel = document.getElementById('debugPanel');
        this.isVisible = false;
        this.logs = [];
        this.maxLogs = 100;
        
        this.initializePanel();
        this.setupEventListeners();
        
        this.log('info', 'Debug panel initialized');
    }

    /**
     * Initialize debug panel elements
     */
    initializePanel() {
        // Get all debug elements
        this.elements = {
            // CDN Status elements
            baseUrlStatus: document.getElementById('baseUrlStatus'),
            authStatus: document.getElementById('authStatus'),
            corsStatus: document.getElementById('corsStatus'),
            
            // Player Status elements
            currentSource: document.getElementById('currentSource'),
            videoState: document.getElementById('videoState'),
            networkState: document.getElementById('networkState'),
            
            // Logs
            debugLogs: document.getElementById('debugLogs')
        };

        // Set initial values
        this.updateCdnStatus({
            baseUrl: 'Not configured',
            authentication: 'None',
            cors: 'Unknown'
        });

        this.updatePlayerStatus({
            currentSource: 'None',
            videoState: 'Ready',
            networkState: 'Unknown'
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Toggle button
        const debugToggle = document.getElementById('debugToggle');
        if (debugToggle) {
            debugToggle.addEventListener('click', () => {
                this.toggle();
            });
        }

        // Listen for Bunny CDN logs
        window.addEventListener('bunnycdn-log', (event) => {
            this.addLog(event.detail);
        });

        // Auto-refresh CDN status
        setInterval(() => {
            this.refreshCdnStatus();
        }, 5000);
    }

    /**
     * Toggle debug panel visibility
     */
    toggle() {
        this.isVisible = !this.isVisible;
        
        if (this.panel) {
            if (this.isVisible) {
                this.panel.style.display = 'block';
                this.panel.classList.add('slide-in');
                
                // Refresh all status information
                this.refreshAllStatus();
            } else {
                this.panel.style.display = 'none';
                this.panel.classList.remove('slide-in');
            }
        }

        this.log('info', `Debug panel ${this.isVisible ? 'shown' : 'hidden'}`);
    }

    /**
     * Update CDN status information
     */
    updateCdnStatus(status) {
        if (this.elements.baseUrlStatus) {
            this.elements.baseUrlStatus.textContent = status.baseUrl || 'Not configured';
            this.elements.baseUrlStatus.className = status.baseUrl ? 'text-success' : 'text-danger';
        }

        if (this.elements.authStatus) {
            this.elements.authStatus.textContent = status.authentication || 'None';
            this.elements.authStatus.className = 
                status.authentication !== 'None' ? 'text-success' : 'text-warning';
        }

        if (this.elements.corsStatus) {
            this.elements.corsStatus.textContent = status.cors || 'Unknown';
            this.elements.corsStatus.className = 
                status.cors === 'OK' ? 'text-success' : 
                status.cors === 'Error' ? 'text-danger' : 'text-warning';
        }

        // Update connection status indicator
        const cdnStatusText = document.getElementById('cdnStatusText');
        const cdnStatusIndicator = document.getElementById('cdnStatusIndicator');
        
        if (cdnStatusText && cdnStatusIndicator) {
            if (status.configured) {
                cdnStatusText.textContent = 'Configured';
                cdnStatusIndicator.className = 'status-dot status-success';
            } else {
                cdnStatusText.textContent = 'Not configured';
                cdnStatusIndicator.className = 'status-dot status-error';
            }
        }
    }

    /**
     * Update player status information
     */
    updatePlayerStatus(status) {
        if (this.elements.currentSource) {
            const source = status.currentSource || 'None';
            this.elements.currentSource.textContent = source;
            this.elements.currentSource.title = source; // Full URL in tooltip
        }

        if (this.elements.videoState) {
            this.elements.videoState.textContent = status.videoState || 'Unknown';
            this.elements.videoState.className = this.getStatusClass(status.videoState);
        }

        if (this.elements.networkState) {
            this.elements.networkState.textContent = status.networkState || 'Unknown';
        }
    }

    /**
     * Get CSS class for status display
     */
    getStatusClass(status) {
        const statusMap = {
            'playing': 'text-success',
            'can-play': 'text-success',
            'can-play-through': 'text-success',
            'error': 'text-danger',
            'loading': 'text-warning',
            'buffering': 'text-warning',
            'stalled': 'text-warning',
            'ready': 'text-info'
        };

        return statusMap[status] || 'text-muted';
    }

    /**
     * Add log entry
     */
    addLog(logEntry) {
        // Add timestamp if not present
        if (!logEntry.timestamp) {
            logEntry.timestamp = new Date().toISOString();
        }

        // Add to logs array
        this.logs.unshift(logEntry);
        
        // Keep only recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }

        // Update UI if visible
        if (this.isVisible) {
            this.renderLogs();
        }
    }

    /**
     * Render logs in the debug panel
     */
    renderLogs() {
        if (!this.elements.debugLogs) return;

        const logsHtml = this.logs.map(log => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            const levelClass = this.getLogLevelClass(log.level);
            const module = log.module ? `[${log.module}] ` : '';
            const dataStr = log.data ? ` - ${JSON.stringify(log.data)}` : '';

            return `
                <div class="debug-log-entry ${levelClass}">
                    <span class="timestamp">${time}</span>
                    <strong>${module}${log.message}</strong>${dataStr}
                </div>
            `;
        }).join('');

        this.elements.debugLogs.innerHTML = logsHtml;
        
        // Auto-scroll to top (newest logs)
        this.elements.debugLogs.scrollTop = 0;
    }

    /**
     * Get CSS class for log level
     */
    getLogLevelClass(level) {
        const levelMap = {
            'info': 'info',
            'warn': 'warn',
            'error': 'error',
            'debug': 'info'
        };

        return levelMap[level] || 'info';
    }

    /**
     * Refresh CDN status
     */
    async refreshCdnStatus() {
        if (!this.isVisible || !window.bunnyCDN) return;

        try {
            // Test CORS if CDN is configured
            if (window.bunnyCDN.baseUrl) {
                const corsResult = await window.bunnyCDN.checkCORS(window.bunnyCDN.baseUrl);
                
                this.updateCdnStatus({
                    baseUrl: window.bunnyCDN.baseUrl,
                    authentication: window.bunnyCDN.token ? 'Token configured' : 'None',
                    cors: corsResult.success ? 'OK' : 'Error',
                    configured: window.bunnyCDN.isConfigured
                });
            }
        } catch (error) {
            this.log('error', 'Failed to refresh CDN status', error.message);
        }
    }

    /**
     * Refresh all status information
     */
    refreshAllStatus() {
        // Refresh CDN status
        this.refreshCdnStatus();

        // Refresh player status if player is available
        if (window.moviePlayer) {
            const playerState = window.moviePlayer.getState();
            this.updatePlayerStatus({
                currentSource: playerState.currentSource,
                videoState: playerState.hasError ? 'error' : 
                           playerState.isLoading ? 'loading' : 'ready',
                networkState: window.moviePlayer.getNetworkStateText()
            });
        }

        // Render logs
        this.renderLogs();
    }

    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
        if (this.elements.debugLogs) {
            this.elements.debugLogs.innerHTML = '<div class="text-muted">Logs cleared</div>';
        }
        this.log('info', 'Debug logs cleared');
    }

    /**
     * Export logs as JSON
     */
    exportLogs() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.log('info', 'Debug logs exported');
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        if (!window.moviePlayer || !window.moviePlayer.video) {
            return null;
        }

        const video = window.moviePlayer.video;
        
        return {
            // Video metrics
            currentTime: video.currentTime,
            duration: video.duration,
            playbackRate: video.playbackRate,
            volume: video.volume,
            
            // Quality metrics
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            
            // Network metrics
            networkState: video.networkState,
            readyState: video.readyState,
            
            // Buffer metrics
            buffered: window.moviePlayer.getBufferedRanges(),
            
            // Performance timing (if available)
            timing: performance.timing ? {
                loadStart: performance.timing.loadEventStart,
                loadEnd: performance.timing.loadEventEnd,
                domContentLoaded: performance.timing.domContentLoadedEventEnd
            } : null
        };
    }

    /**
     * Display performance metrics
     */
    showPerformanceMetrics() {
        const metrics = this.getPerformanceMetrics();
        if (metrics) {
            this.log('info', 'Performance metrics', metrics);
        }
    }

    /**
     * Internal logging
     */
    log(level, message, data = null) {
        this.addLog({
            timestamp: new Date().toISOString(),
            level: level,
            module: 'DebugPanel',
            message: message,
            data: data
        });
    }
}

// Initialize debug panel
window.debugPanel = new DebugPanel();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DebugPanel;
}
