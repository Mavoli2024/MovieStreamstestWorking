/**
 * Clerk Authentication System for Madifa Streaming
 */

class ClerkAuthSystem {
    constructor() {
        this.clerk = null;
        this.currentUser = null;
        this.isLoading = true;
        this.isAuthenticated = false;
        
        this.initialize();
    }

    async initialize() {
        this.log('info', 'Clerk authentication system initializing...');
        
        try {
            // You'll need to replace 'your-clerk-publishable-key' with your actual Clerk publishable key
            const clerkPublishableKey = 'pk_test_YWRhcHRlZC1zcXVpcnJlbC0yMi5jbGVyay5hY2NvdW50cy5kZXYk'; // This will be provided via environment
            
            if (!clerkPublishableKey || clerkPublishableKey.startsWith('pk_test_your')) {
                this.log('error', 'Clerk publishable key not configured');
                this.showConfigurationError();
                return;
            }

            // Initialize Clerk
            this.clerk = new window.Clerk(clerkPublishableKey);
            await this.clerk.load();

            // Set up auth state listener
            this.clerk.addListener(({ user }) => {
                this.currentUser = user;
                this.isAuthenticated = !!user;
                this.isLoading = false;
                this.updateUI();
                this.log('info', 'Auth state updated', { authenticated: this.isAuthenticated });
            });

            // Mount Clerk components
            this.mountClerkComponents();
            
            this.log('info', 'Clerk authentication system ready');
        } catch (error) {
            this.log('error', 'Failed to initialize Clerk', error.message);
            this.showConfigurationError();
        }
    }

    showConfigurationError() {
        const errorHtml = `
            <div class="alert alert-warning" role="alert">
                <h4 class="alert-heading">Authentication Setup Required</h4>
                <p>To use the sign-in functionality, you need to:</p>
                <ol>
                    <li>Create a <a href="https://clerk.com" target="_blank">Clerk account</a></li>
                    <li>Get your publishable key from the Clerk dashboard</li>
                    <li>Add it to the configuration</li>
                </ol>
                <p class="mb-0">For now, you can browse the movie previews below.</p>
            </div>
        `;
        
        // Show error where sign-in buttons would be
        const userButton = document.getElementById('clerk-user-button');
        const signInButton = document.getElementById('clerk-sign-in-button');
        
        if (userButton) userButton.innerHTML = '<span class="text-warning">Setup Required</span>';
        if (signInButton) signInButton.innerHTML = errorHtml;
        
        this.isLoading = false;
        this.updateUI();
    }

    mountClerkComponents() {
        try {
            // Mount user button in header
            const userButtonDiv = document.getElementById('clerk-user-button');
            if (userButtonDiv) {
                this.clerk.mountUserButton(userButtonDiv, {
                    appearance: {
                        elements: {
                            userButtonAvatarBox: 'w-8 h-8',
                            userButtonPopoverCard: 'bg-white border border-gray-200 rounded-lg shadow-lg',
                        }
                    }
                });
            }

            // Mount sign-in button in hero section
            const signInButtonDiv = document.getElementById('clerk-sign-in-button');
            if (signInButtonDiv) {
                this.clerk.mountSignInButton(signInButtonDiv, {
                    mode: 'modal',
                    appearance: {
                        elements: {
                            formButtonPrimary: 'btn btn-outline-light btn-lg'
                        }
                    }
                });
            }
        } catch (error) {
            this.log('error', 'Failed to mount Clerk components', error.message);
        }
    }

    /**
     * Update UI based on authentication state
     */
    updateUI() {
        // Show/hide content based on auth state
        this.updateContentVisibility();
        
        // Update user info if logged in
        if (this.isAuthenticated && this.currentUser) {
            this.displayUserInfo();
        }
    }

    /**
     * Update content visibility based on auth state
     */
    updateContentVisibility() {
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
                <button class="btn btn-primary btn-sm clerk-sign-in-overlay">Sign In</button>
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

        // Handle sign-in button click
        const signInBtn = overlay.querySelector('.clerk-sign-in-overlay');
        if (signInBtn && this.clerk) {
            signInBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.clerk.openSignIn();
            });
        }

        // Prevent clicking on movie if not authenticated
        card.addEventListener('click', (e) => {
            if (!this.isAuthenticated) {
                e.preventDefault();
                e.stopPropagation();
                if (this.clerk) {
                    this.clerk.openSignIn();
                }
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

        colDiv.innerHTML = `
            <div class="movie-card" data-filename="${movie.url}">
                <div class="movie-poster">
                    <div class="placeholder-poster">
                        <i data-feather="film" class="poster-icon"></i>
                    </div>
                    <div class="play-overlay">
                        <i data-feather="play-circle" class="play-icon"></i>
                    </div>
                    <div class="movie-badge">Available</div>
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
     * Display user information
     */
    displayUserInfo() {
        if (this.currentUser) {
            this.log('info', 'User info displayed', { 
                name: this.getDisplayName(), 
                email: this.currentUser.primaryEmailAddress?.emailAddress
            });
        }
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
        if (this.currentUser.primaryEmailAddress) {
            return this.currentUser.primaryEmailAddress.emailAddress.split('@')[0];
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
        };

        const requestOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        // Add Clerk session token
        if (this.clerk && this.clerk.session) {
            requestOptions.headers['Authorization'] = `Bearer ${await this.clerk.session.getToken()}`;
        }

        try {
            const response = await fetch(url, requestOptions);
            
            if (response.status === 401) {
                // Unauthorized - prompt to sign in
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
        this.log('warn', 'Unauthorized access detected, prompting sign in');
        if (this.clerk) {
            this.clerk.openSignIn();
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
            module: 'ClerkAuthSystem',
            message,
            data
        };

        // Console logging
        const consoleMethod = console[level] || console.log;
        if (data) {
            consoleMethod(`[${timestamp}] [ClerkAuthSystem] ${message}`, data);
        } else {
            consoleMethod(`[${timestamp}] [ClerkAuthSystem] ${message}`);
        }

        // Send to debug panel if available
        if (window.debugPanel && typeof window.debugPanel.addLog === 'function') {
            window.debugPanel.addLog(logEntry);
        }
    }
}

// Initialize Clerk authentication system
document.addEventListener('DOMContentLoaded', () => {
    window.clerkAuthSystem = new ClerkAuthSystem();
    
    // Also make it available as authSystem for compatibility
    window.authSystem = window.clerkAuthSystem;
});

// Make ClerkAuthSystem globally available
window.ClerkAuthSystem = ClerkAuthSystem;