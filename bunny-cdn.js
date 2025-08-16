/**
 * Bunny CDN Integration Module
 * Handles CDN URL construction, authentication, and testing
 */

class BunnyCDN {
    constructor() {
        this.baseUrl = '';
        this.token = '';
        this.zone = '';
        this.pullZone = '';
        this.isConfigured = false;
        
        // Load configuration from environment or localStorage
        this.loadConfiguration();
        
        // Initialize debugging
        this.debugMode = true;
    }

    /**
     * Load CDN configuration from various sources
     */
    loadConfiguration() {
        // Try to get from environment variables first
        const envBaseUrl = this.getEnvVar('BUNNY_CDN_BASE_URL', '');
        const envToken = this.getEnvVar('BUNNY_CDN_TOKEN', '');
        const envZone = this.getEnvVar('BUNNY_CDN_ZONE', '');

        // Fallback to localStorage
        const storedConfig = localStorage.getItem('bunnyCdnConfig');
        if (storedConfig) {
            try {
                const config = JSON.parse(storedConfig);
                this.baseUrl = envBaseUrl || config.baseUrl || '';
                this.token = envToken || config.token || '';
                this.zone = envZone || config.zone || '';
            } catch (e) {
                this.log('error', 'Failed to parse stored CDN configuration', e);
            }
        } else {
            this.baseUrl = envBaseUrl;
            this.token = envToken;
            this.zone = envZone;
        }

        this.updateConfigurationStatus();
        this.log('info', 'CDN Configuration loaded', {
            hasBaseUrl: !!this.baseUrl,
            hasToken: !!this.token,
            hasZone: !!this.zone
        });
    }

    /**
     * Get environment variable with fallback
     */
    getEnvVar(name, fallback) {
        // In browser environment, we can't access process.env directly
        // This would work in Node.js or with bundlers that inject env vars
        if (typeof process !== 'undefined' && process.env) {
            return process.env[name] || fallback;
        }
        return fallback;
    }

    /**
     * Update CDN configuration
     */
    updateConfiguration(config) {
        this.baseUrl = config.baseUrl || '';
        this.token = config.token || '';
        this.zone = config.zone || this.extractZoneFromUrl(this.baseUrl);
        
        // Store in localStorage for persistence
        const configToStore = {
            baseUrl: this.baseUrl,
            token: this.token,
            zone: this.zone
        };
        
        localStorage.setItem('bunnyCdnConfig', JSON.stringify(configToStore));
        
        this.updateConfigurationStatus();
        this.log('info', 'CDN Configuration updated', configToStore);
        
        return this.isConfigured;
    }

    /**
     * Extract zone name from Bunny CDN URL
     */
    extractZoneFromUrl(url) {
        if (!url) return '';
        
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;
            
            // Extract zone from hostname like "zone-name.b-cdn.net"
            if (hostname.includes('.b-cdn.net')) {
                return hostname.replace('.b-cdn.net', '');
            }
            
            return hostname;
        } catch (e) {
            this.log('warn', 'Failed to extract zone from URL', url);
            return '';
        }
    }

    /**
     * Update configuration status
     */
    updateConfigurationStatus() {
        this.isConfigured = !!this.baseUrl;
        
        // Update debug panel if available (with safety check)
        if (window.debugPanel && typeof window.debugPanel.updateCdnStatus === 'function') {
            window.debugPanel.updateCdnStatus({
                baseUrl: this.baseUrl || 'Not configured',
                authentication: this.token ? 'Token configured' : 'No authentication',
                configured: this.isConfigured
            });
        }
    }

    /**
     * Construct full video URL from filename or partial URL
     */
    constructVideoUrl(source) {
        if (!source) {
            this.log('error', 'No video source provided');
            return null;
        }

        // If it's already a complete URL, return as-is
        if (source.startsWith('http://') || source.startsWith('https://')) {
            this.log('info', 'Using complete URL', source);
            return source;
        }

        // If no base URL configured, return source as-is
        if (!this.baseUrl) {
            this.log('warn', 'No CDN base URL configured, using source as-is', source);
            return source;
        }

        // Construct URL from base URL and filename
        const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl : this.baseUrl + '/';
        const filename = source.startsWith('/') ? source.substring(1) : source;
        const fullUrl = baseUrl + filename;

        this.log('info', 'Constructed CDN URL', {
            source: source,
            baseUrl: baseUrl,
            fullUrl: fullUrl
        });

        return fullUrl;
    }

    /**
     * Get headers for CDN requests
     */
    getRequestHeaders() {
        const headers = {
            'Accept': 'video/*,*/*;q=0.9',
            'Cache-Control': 'no-cache'
        };

        // Add authentication if token is available
        if (this.token) {
            // Bunny CDN typically uses token in query parameter or custom header
            headers['Authorization'] = `Bearer ${this.token}`;
            // Alternative: headers['AccessKey'] = this.token;
        }

        return headers;
    }

    /**
     * Test CDN connection and video availability
     */
    async testConnection(videoUrl = null) {
        const testUrl = videoUrl || this.constructVideoUrl('test-connection');
        
        if (!testUrl) {
            this.log('error', 'Cannot test connection: No URL available');
            return { success: false, error: 'No URL configured' };
        }

        this.log('info', 'Testing CDN connection', testUrl);

        try {
            // First, test with HEAD request to check if file exists
            const headResponse = await fetch(testUrl, {
                method: 'HEAD',
                headers: this.getRequestHeaders(),
                mode: 'cors',
                cache: 'no-cache'
            });

            if (headResponse.ok) {
                const contentType = headResponse.headers.get('Content-Type');
                const contentLength = headResponse.headers.get('Content-Length');
                
                this.log('info', 'CDN connection successful', {
                    status: headResponse.status,
                    contentType: contentType,
                    contentLength: contentLength
                });

                return {
                    success: true,
                    contentType: contentType,
                    contentLength: contentLength,
                    headers: Object.fromEntries(headResponse.headers.entries())
                };
            } else {
                this.log('error', 'CDN connection failed', {
                    status: headResponse.status,
                    statusText: headResponse.statusText
                });

                return {
                    success: false,
                    error: `HTTP ${headResponse.status}: ${headResponse.statusText}`
                };
            }

        } catch (error) {
            this.log('error', 'CDN connection error', error.message);
            
            // Determine error type for better debugging
            let errorMessage = error.message;
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error - check CORS configuration or URL accessibility';
            }

            return {
                success: false,
                error: errorMessage,
                details: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                }
            };
        }
    }

    /**
     * Get optimized video URL with quality parameters
     */
    getOptimizedUrl(source, options = {}) {
        let url = this.constructVideoUrl(source);
        
        if (!url) return null;

        // Add optimization parameters if supported
        const params = new URLSearchParams();
        
        if (options.width) params.append('width', options.width);
        if (options.height) params.append('height', options.height);
        if (options.quality) params.append('quality', options.quality);
        if (options.format) params.append('format', options.format);
        
        // Add token as query parameter if not in headers
        if (this.token && !url.includes('token=')) {
            params.append('token', this.token);
        }

        if (params.toString()) {
            url += (url.includes('?') ? '&' : '?') + params.toString();
        }

        this.log('info', 'Generated optimized URL', { source, options, url });
        return url;
    }

    /**
     * Check CORS configuration
     */
    async checkCORS(url) {
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                mode: 'cors',
                headers: this.getRequestHeaders()
            });

            const corsHeaders = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            };

            this.log('info', 'CORS headers', corsHeaders);
            return { success: true, headers: corsHeaders };

        } catch (error) {
            this.log('error', 'CORS check failed', error.message);
            return { success: false, error: error.message };
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
            module: 'BunnyCDN',
            message,
            data
        };

        // Console logging
        const consoleMethod = console[level] || console.log;
        if (data) {
            consoleMethod(`[${timestamp}] [BunnyCDN] ${message}`, data);
        } else {
            consoleMethod(`[${timestamp}] [BunnyCDN] ${message}`);
        }

        // Send to debug panel if available
        if (window.debugPanel) {
            window.debugPanel.addLog(logEntry);
        }

        // Emit custom event for other components
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('bunnycdn-log', { 
                detail: logEntry 
            }));
        }
    }
}

// Create global instance
window.bunnyCDN = new BunnyCDN();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BunnyCDN;
}
