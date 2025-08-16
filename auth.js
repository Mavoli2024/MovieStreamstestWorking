/**
 * Authentication System for Madifa Streaming
 * Handles user authentication state and API calls
 */

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isLoading = true;
        this.isAuthenticated = false;
        
        this.initialize();
    }

    async initialize() {
        this.log('info', 'Authentication system initializing...');
        await this.checkAuthStatus();
        this.updateUI();
        this.log('info', 'Authentication system ready');
    }

    /**
     * Check if user is authenticated
     */
    async checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/user');
            
            if (response.ok) {
                this.currentUser = await response.json();
                this.isAuthenticated = true;
                this.log('info', 'User authenticated', { email: this.currentUser.email });
            } else if (response.status === 401) {
                // User not authenticated
                this.currentUser = null;
                this.isAuthenticated = false;
                this.log('info', 'User not authenticated');
            } else {
                throw new Error(`Auth check failed: ${response.statusText}`);
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
        // Update navigation buttons
        this.updateNavigationButtons();
        
        // Show/hide content based on auth state
        this.updateContentVisibility();
        
        // Update user info if logged in
        if (this.isAuthenticated && this.currentUser) {
            this.displayUserInfo();
        }
    }

    /**
     * Update navigation buttons
     */
    updateNavigationButtons() {
        const authButtons = document.querySelectorAll('a[href="/api/login"]');
        
        authButtons.forEach(button => {
            if (this.isAuthenticated) {
                // Show logout option
                button.textContent = 'Sign Out';
                button.href = '#';
                button.classList.remove('btn-primary', 'btn-outline-light');
                button.classList.add('btn-outline-danger');
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            } else {
                // Show login option
                button.textContent = button.classList.contains('btn-lg') ? 'Sign In & Start Watching' : 'Sign In';
                button.href = '/auth.html';
            }
        });
    }

    /**
     * Update content visibility based on auth state
     */
    updateContentVisibility() {
        // If user is not authenticated, show public content
        if (!this.isAuthenticated) {
            this.showPublicContent();
        } else {
            this.showAuthenticatedContent();
        }
    }

    /**
     * Show content for non-authenticated users
     */
    showPublicContent() {
        // Show hero section with sign up prompts
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.display = 'block';
        }

        // Show limited movie grid
        this.showLimitedMovies();
        
        this.log('info', 'Showing public content');
    }

    /**
     * Show content for authenticated users
     */
    showAuthenticatedContent() {
        // Load full movie catalog for authenticated users
        this.loadAuthenticatedMovies();
        
        this.log('info', 'Showing authenticated content');
    }

    /**
     * Show limited movies for public users
     */
    showLimitedMovies() {
        const movieCards = document.querySelectorAll('.movie-card');
        
        movieCards.forEach((card, index) => {
            if (index < 3) {
                // Show first 3 movies as previews
                card.style.display = 'block';
                card.style.opacity = '1';
                
                // Add "Sign in to watch" overlay
                this.addSignInOverlay(card);
            } else {
                // Hide additional movies
                card.style.display = 'none';
            }
        });
    }

    /**
     * Add sign-in overlay to movie cards for non-authenticated users
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
                <a href="/auth.html" class="btn btn-primary btn-sm">Sign In</a>
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

        // Re-initialize feather icons for the new icon
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    /**
     * Load movies for authenticated users
     */
    async loadAuthenticatedMovies() {
        try {
            const response = await fetch('/api/movies');
            
            if (response.ok) {
                const movies = await response.json();
                this.displayMovies(movies);
                this.log('info', 'Loaded authenticated movies', { count: movies.length });
            } else {
                throw new Error('Failed to load movies');
            }
        } catch (error) {
            this.log('error', 'Failed to load authenticated movies', error.message);
        }
    }

    /**
     * Display movies in the UI
     */
    displayMovies(movies) {
        const moviesList = document.getElementById('moviesList');
        if (!moviesList) return;

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

        // Create movie card structure safely using DOM methods
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.setAttribute('data-filename', movie.url); // Safe attribute setting

        const posterDiv = document.createElement('div');
        posterDiv.className = 'movie-poster';

        const placeholderDiv = document.createElement('div');
        placeholderDiv.className = 'placeholder-poster';

        const filmIcon = document.createElement('i');
        filmIcon.setAttribute('data-feather', 'film');
        filmIcon.className = 'poster-icon';

        const playOverlay = document.createElement('div');
        playOverlay.className = 'play-overlay';

        const playIcon = document.createElement('i');
        playIcon.setAttribute('data-feather', 'play-circle');
        playIcon.className = 'play-icon';

        const badge = document.createElement('div');
        badge.className = 'movie-badge';
        badge.textContent = 'Available'; // Safe text setting

        const infoDiv = document.createElement('div');
        infoDiv.className = 'movie-info';

        const title = document.createElement('h6');
        title.textContent = movie.title; // Safe text setting - prevents XSS

        const description = document.createElement('small');
        description.className = 'text-muted';
        description.textContent = movie.description; // Safe text setting - prevents XSS

        // Assemble the DOM structure
        placeholderDiv.appendChild(filmIcon);
        playOverlay.appendChild(playIcon);
        posterDiv.appendChild(placeholderDiv);
        posterDiv.appendChild(playOverlay);
        posterDiv.appendChild(badge);
        
        infoDiv.appendChild(title);
        infoDiv.appendChild(description);
        
        movieCard.appendChild(posterDiv);
        movieCard.appendChild(infoDiv);
        colDiv.appendChild(movieCard);

        // Add click handler
        movieCard.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.streamingApp) {
                window.streamingApp.selectMovie(movieCard);
            }
        });

        return colDiv;
    }

    /**
     * Display user information
     */
    displayUserInfo() {
        // You can add user info display here if needed
        this.log('info', 'User info displayed', { 
            name: this.getDisplayName(), 
            email: this.currentUser.email 
        });
    }

    /**
     * Get display name for user
     */
    getDisplayName() {
        if (this.currentUser.firstName && this.currentUser.lastName) {
            return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        }
        if (this.currentUser.firstName) {
            return this.currentUser.firstName;
        }
        if (this.currentUser.email) {
            return this.currentUser.email.split('@')[0];
        }
        return 'User';
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
                // Unauthorized - redirect to login
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
        this.log('warn', 'Unauthorized access detected, redirecting to login');
        window.location.href = '/auth.html';
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
     * Get authentication state
     */
    getAuthState() {
        return {
            isAuthenticated: this.isAuthenticated,
            isLoading: this.isLoading,
            user: this.currentUser
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
            module: 'AuthSystem',
            message,
            data
        };

        // Console logging
        const consoleMethod = console[level] || console.log;
        if (data) {
            consoleMethod(`[${timestamp}] [AuthSystem] ${message}`, data);
        } else {
            consoleMethod(`[${timestamp}] [AuthSystem] ${message}`);
        }

        // Send to debug panel if available
        if (window.debugPanel && typeof window.debugPanel.addLog === 'function') {
            window.debugPanel.addLog(logEntry);
        }
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});

// Make auth system globally available
window.AuthSystem = AuthSystem;