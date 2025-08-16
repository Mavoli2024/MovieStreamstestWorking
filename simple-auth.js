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
        this.log('info', 'Authentication system initializing...');
        
        // Check authentication status
        await this.checkAuthStatus();
        
        // Set up click handlers for sign-in buttons
        this.setupSignInButtons();
        
        // Initialize UI
        this.updateUI();
        
        this.log('info', 'Authentication system ready');
    }

    setupSignInButtons() {
        // Header sign-in button
        const signInBtn = document.getElementById('signInBtn');
        if (signInBtn) {
            signInBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/auth.html';
            });
        }

        // Hero section sign-in button
        const heroSignInBtn = document.getElementById('heroSignInBtn');
        if (heroSignInBtn) {
            heroSignInBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/auth.html';
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
     * Check if user is authenticated
     */
    async checkAuthStatus() {
        this.isLoading = true;
        try {
            // First try the protected auth endpoint
            const response = await fetch('/api/auth/user', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.currentUser = await response.json();
                this.isAuthenticated = true;
                this.log('info', 'User authenticated', { email: this.currentUser.email });
            } else if (response.status === 401) {
                this.currentUser = null;
                this.isAuthenticated = false;
                this.log('info', 'User not authenticated');
            } else {
                throw new Error(`Auth check failed: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            this.log('error', 'Failed to check auth status', error.message);
            this.currentUser = null;
            this.isAuthenticated = false;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Update UI based on authentication state
     */
    updateUI() {
        // Update sign-in buttons
        this.updateSignInButtons();
        
        if (!this.isAuthenticated) {
            this.showPublicContent();
        } else {
            this.showAuthenticatedContent();
        }
    }

    /**
     * Update sign-in buttons based on auth state
     */
    updateSignInButtons() {
        const signInBtn = document.getElementById('signInBtn');
        const heroSignInBtn = document.getElementById('heroSignInBtn');
        
        if (this.isAuthenticated && this.currentUser) {
            // Show logout option
            if (signInBtn) {
                signInBtn.textContent = 'Sign Out';
                signInBtn.classList.remove('btn-primary');
                signInBtn.classList.add('btn-outline-danger');
                signInBtn.onclick = (e) => {
                    e.preventDefault();
                    this.logout();
                };
            }
            
            if (heroSignInBtn) {
                heroSignInBtn.style.display = 'none';
            }
        } else {
            // Show sign-in option
            if (signInBtn) {
                signInBtn.textContent = 'Sign In';
                signInBtn.classList.remove('btn-outline-danger');
                signInBtn.classList.add('btn-primary');
            }
            
            if (heroSignInBtn) {
                heroSignInBtn.style.display = 'inline-block';
                heroSignInBtn.textContent = 'Sign In & Start Watching';
            }
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'same-origin'
            });
            
            if (response.ok) {
                this.currentUser = null;
                this.isAuthenticated = false;
                this.updateUI();
                this.log('info', 'User logged out successfully');
                // Refresh the page to reset everything
                window.location.reload();
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            this.log('error', 'Logout failed', error.message);
        }
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

        // Show limited movies for non-authenticated users
        this.showLimitedMovies();
        
        this.log('info', 'Showing public content');
    }

    /**
     * Show content for authenticated users
     */
    showAuthenticatedContent() {
        // Hide hero section for authenticated users
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.display = 'none';
        }

        // Load full movie catalog
        this.loadAuthenticatedMovies();
        
        this.log('info', 'Showing authenticated content');
    }

    /**
     * Show limited movies for non-authenticated users
     */
    showLimitedMovies() {
        const movieCards = document.querySelectorAll('.movie-card');
        
        movieCards.forEach((card, index) => {
            if (index < 3) {
                // Show first 3 movies as previews
                card.style.display = 'block';
                card.style.opacity = '1';
                
                // Add sign-in overlay
                this.addSignInOverlay(card);
            } else {
                // Hide additional movies
                card.style.display = 'none';
            }
        });
    }

    /**
     * Show all movies (authenticated users)
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
            
            // Remove any click event restrictions
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            // Re-add the click handler for movie selection
            newCard.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.streamingApp) {
                    window.streamingApp.selectMovie(newCard);
                }
            });
        });

        this.log('info', 'All movies shown for authenticated user');
    }

    /**
     * Add sign-in overlay to movie cards
     */
    addSignInOverlay(card) {
        // Remove existing overlays
        const existingOverlay = card.querySelector('.auth-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create sign-in overlay
        const overlay = document.createElement('div');
        overlay.className = 'auth-overlay';
        overlay.innerHTML = `
            <div class="auth-overlay-content">
                <i data-feather="lock" class="auth-icon"></i>
                <p>Sign in to watch</p>
                <button class="btn btn-primary btn-sm" onclick="window.location.href='/auth.html'">Sign In</button>
            </div>
        `;

        // Style the overlay
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            border-radius: 8px;
            z-index: 10;
        `;

        // Style overlay content
        const overlayContent = overlay.querySelector('.auth-overlay-content');
        if (overlayContent) {
            overlayContent.style.cssText = `
                text-align: center;
                color: white;
                padding: 20px;
            `;
        }

        // Show overlay on hover
        card.style.position = 'relative';
        card.appendChild(overlay);

        card.addEventListener('mouseenter', () => {
            overlay.style.opacity = '1';
        });

        card.addEventListener('mouseleave', () => {
            overlay.style.opacity = '0';
        });

        // Prevent clicking on movie if not authenticated
        card.addEventListener('click', (e) => {
            if (!this.isAuthenticated) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '/auth.html';
            }
        });

        // Re-initialize feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    /**
     * Load movies for authenticated users
     */
    async loadAuthenticatedMovies() {
        try {
            const response = await this.apiRequest('/api/movies');
            
            if (response.ok) {
                const movies = await response.json();
                this.displayMovies(movies);
                this.log('info', 'Loaded authenticated movies', { count: movies.length });
            } else if (response.status === 401) {
                // User is not authenticated, show limited content
                this.showLimitedMovies();
            } else {
                // Show all default movies if API fails
                this.showAllMovies();
            }
        } catch (error) {
            this.log('error', 'Failed to load authenticated movies', error.message);
            this.showAllMovies();
        }
    }

    /**
     * Make authenticated API request
     */
    async apiRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
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
            
            if (response.status === 401) {
                // Unauthorized - redirect to auth page
                this.handleUnauthorized();
                throw new Error('Unauthorized');
            }

            return response;
        } catch (error) {
            this.log('error', 'API request failed', { url, error: error.message });
            throw error;
        }
    }

    /**
     * Handle unauthorized access
     */
    handleUnauthorized() {
        this.log('warn', 'Unauthorized access detected, redirecting to auth');
        window.location.href = '/auth.html';
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