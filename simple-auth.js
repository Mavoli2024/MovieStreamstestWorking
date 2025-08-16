/**
 * Simple Authentication System for Madifa Streaming
 * No external services required - handles UI interactions locally
 */

class SimpleAuthSystem {
    constructor() {
        this.currentUser = null;
        this.isLoading = false;
        this.isAuthenticated = false;
        
        this.initialize();
    }

    async initialize() {
        this.log('info', 'Simple authentication system initializing...');
        
        // Set up click handlers for sign-in buttons
        this.setupSignInButtons();
        
        // Initialize UI
        this.updateUI();
        
        this.log('info', 'Simple authentication system ready');
    }

    setupSignInButtons() {
        // Header sign-in button
        const signInBtn = document.getElementById('signInBtn');
        if (signInBtn) {
            signInBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showComingSoonMessage();
            });
        }

        // Hero section sign-in button
        const heroSignInBtn = document.getElementById('heroSignInBtn');
        if (heroSignInBtn) {
            heroSignInBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showComingSoonMessage();
            });
        }
    }

    showComingSoonMessage() {
        // Create and show a modal or alert
        const alertHtml = `
            <div class="alert alert-info alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; max-width: 400px;" role="alert">
                <h5 class="alert-heading">
                    <i data-feather="info" class="me-2"></i>
                    Authentication Coming Soon!
                </h5>
                <p class="mb-2">We're working on user accounts and authentication. For now, you can:</p>
                <ul class="mb-3">
                    <li>Browse and watch all movie trailers</li>
                    <li>Test the video player features</li>
                    <li>Explore the streaming interface</li>
                </ul>
                <p class="mb-0 text-muted">Sign-up and premium features will be available soon!</p>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Remove any existing alerts
        const existingAlert = document.querySelector('.auth-coming-soon-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Add the alert to the page
        const alertDiv = document.createElement('div');
        alertDiv.innerHTML = alertHtml;
        alertDiv.className = 'auth-coming-soon-alert';
        document.body.appendChild(alertDiv);

        // Re-initialize feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        // Auto-remove after 8 seconds
        setTimeout(() => {
            const alert = document.querySelector('.auth-coming-soon-alert .alert');
            if (alert) {
                alert.classList.remove('show');
                setTimeout(() => {
                    const container = document.querySelector('.auth-coming-soon-alert');
                    if (container) {
                        container.remove();
                    }
                }, 300);
            }
        }, 8000);

        this.log('info', 'Authentication coming soon message displayed');
    }

    /**
     * Update UI based on authentication state
     */
    updateUI() {
        // For now, always show public content since auth is disabled
        this.showPublicContent();
    }

    /**
     * Show content for non-authenticated users
     */
    showPublicContent() {
        // Show hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.display = 'block';
        }

        // Show all movies since auth is disabled
        this.showAllMovies();
        
        this.log('info', 'Showing public content (all movies available)');
    }

    /**
     * Show all movies (no authentication required)
     */
    showAllMovies() {
        const movieCards = document.querySelectorAll('.movie-card');
        
        movieCards.forEach((card, index) => {
            // Show all movies
            card.style.display = 'block';
            card.style.opacity = '1';
            
            // Remove any existing auth overlays
            const existingOverlay = card.querySelector('.auth-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
            
            // Make sure click handlers work
            card.style.cursor = 'pointer';
        });

        this.log('info', 'All movies shown (no authentication required)');
    }

    /**
     * Make API request (no auth required for now)
     */
    async apiRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const requestOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, requestOptions);
            return response;
        } catch (error) {
            this.log('error', 'API request failed', { url, error: error.message });
            throw error;
        }
    }

    /**
     * Get authentication state
     */
    getAuthState() {
        return {
            isAuthenticated: false,
            isLoading: false,
            user: null
        };
    }

    /**
     * Load movies (public access)
     */
    async loadMovies() {
        try {
            const response = await this.apiRequest('/api/movies');
            
            if (response.ok) {
                const movies = await response.json();
                this.displayMovies(movies);
                this.log('info', 'Loaded movies', { count: movies.length });
                return movies;
            } else {
                // If movies API requires auth, just show the hardcoded ones
                this.log('info', 'Movies API not available, using default movies');
                return null;
            }
        } catch (error) {
            this.log('error', 'Failed to load movies', error.message);
            return null;
        }
    }

    /**
     * Display movies in the UI
     */
    displayMovies(movies) {
        const moviesList = document.getElementById('moviesList');
        if (!moviesList || !movies) return;

        // Clear existing movies
        moviesList.innerHTML = '';

        movies.forEach(movie => {
            const movieCard = this.createMovieCard(movie);
            moviesList.appendChild(movieCard);
        });

        // Re-initialize feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    /**
     * Create a movie card element
     */
    createMovieCard(movie) {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-6 col-lg-4';

        colDiv.innerHTML = `
            <div class="movie-card" data-filename="${movie.url}">
                <div class="movie-poster">
                    <div class="placeholder-poster">
                        <i data-feather="film" class="poster-icon"></i>
                    </div>
                    <div class="play-overlay">
                        <i data-feather="play-circle" class="play-icon"></i>
                    </div>
                    <div class="movie-badge">Free</div>
                </div>
                <div class="movie-info">
                    <h6>${movie.title}</h6>
                    <small class="text-muted">${movie.description}</small>
                </div>
            </div>
        `;

        // Add click handler
        const movieCard = colDiv.querySelector('.movie-card');
        movieCard.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.streamingApp) {
                window.streamingApp.selectMovie(movieCard);
            }
        });

        return colDiv;
    }

    /**
     * Logging utility
     */
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            module: 'SimpleAuthSystem',
            message,
            data
        };

        // Console logging
        const consoleMethod = console[level] || console.log;
        if (data) {
            consoleMethod(`[${timestamp}] [SimpleAuthSystem] ${message}`, data);
        } else {
            consoleMethod(`[${timestamp}] [SimpleAuthSystem] ${message}`);
        }

        // Send to debug panel if available
        if (window.debugPanel && typeof window.debugPanel.addLog === 'function') {
            window.debugPanel.addLog(logEntry);
        }
    }
}

// Initialize simple authentication system
document.addEventListener('DOMContentLoaded', () => {
    window.simpleAuthSystem = new SimpleAuthSystem();
    
    // Make it available as authSystem for compatibility with existing code
    window.authSystem = window.simpleAuthSystem;
});

// Make SimpleAuthSystem globally available
window.SimpleAuthSystem = SimpleAuthSystem;