# Madifa Streaming App with Bunny CDN

## Overview

This is a web-based movie streaming application featuring authentic South African content, integrating with Bunny CDN (vz-685277f9-aa1.b-cdn.net) for content delivery. The application provides a custom video player with advanced error handling, debugging capabilities, and real-time monitoring. It includes both client-side JavaScript components and a Node.js/Express server with PostgreSQL database integration for user authentication and content management.

## Recent Changes (Performance Optimization - August 19, 2025)

✓ **LATEST FIXES (August 19, 2025)**:
   - Fixed missing "dev" script in package.json using npm pkg set command
   - Resolved port conflict by clearing existing tsx processes
   - Updated all movie cards to use correct Madifa Bunny CDN URLs instead of Google sample videos
   - Server now properly runs and shows authentic South African content from vz-685277f9-aa1.b-cdn.net

✓ **CRITICAL FIXES IMPLEMENTED**:
   - Fixed video playback performance issues with throttled event listeners
   - Added adaptive quality selection based on connection speed testing
   - Implemented CDN fallback URLs for improved reliability
   - Enhanced error recovery with smart retry mechanisms
   - Optimized loading performance with script deferring and DNS prefetching

✓ **Previous Migration (August 18, 2025)**:
   - Successfully migrated from Replit Agent to standard Replit environment
   - Installed all Node.js dependencies including Express, TypeScript, Drizzle ORM
   - Created and configured PostgreSQL database with users and sessions tables
   - Fixed TypeScript/ES module configuration issues
   - Updated movie catalog to feature authentic Madifa content from Bunny CDN
   - Resolved authentication flow issues causing "Section Error"

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application follows a modular JavaScript architecture with separate classes for distinct responsibilities:
- **VideoPlayer class**: Handles video playback, streaming controls, and error management
- **BunnyCDN class**: Manages CDN integration, URL construction, and authentication
- **DebugPanel class**: Provides real-time debugging and monitoring capabilities
- **StreamingApp class**: Main orchestrator that coordinates all components

### Configuration Management
The application uses a flexible configuration system that prioritizes environment variables over localStorage:
- Environment variables for production deployment (BUNNY_CDN_BASE_URL, BUNNY_CDN_TOKEN, BUNNY_CDN_ZONE)
- localStorage fallback for client-side configuration persistence
- Runtime configuration updates through the debug panel

### Error Handling and Debugging
Comprehensive error management system with multiple layers:
- Video player error recovery with automatic retry mechanism (max 3 retries)
- Real-time debug panel showing CDN status, player state, and network conditions
- Structured logging system with different severity levels
- Visual error overlays with user-friendly error messages

### Video Streaming Architecture
Custom video player implementation designed for streaming:
- Cross-origin resource sharing (CORS) support for CDN content
- Adaptive loading states with visual feedback
- Playsinline attributes for mobile compatibility
- Metadata preloading for faster startup times

### User Interface Design
Bootstrap-based responsive design with:
- Dark theme header with application branding
- Collapsible debug panel for development and troubleshooting
- Loading and error overlays for better user experience
- Feather icons for consistent iconography

## External Dependencies

### CDN Services
- **Bunny CDN**: Primary content delivery network for video streaming
  - Requires base URL, authentication token, and zone configuration
  - Supports pull zone architecture for content distribution

### Frontend Libraries
- **Bootstrap 5.3.0**: UI framework for responsive design and components
- **Feather Icons**: Lightweight icon library for user interface elements

### Browser APIs
- **HTML5 Video API**: Core video playback functionality
- **localStorage API**: Client-side configuration persistence
- **DOM API**: Dynamic content manipulation and event handling

### Development Tools
- Environment variable support for configuration management
- Console logging for debugging and monitoring
- Real-time status monitoring for CDN and player health