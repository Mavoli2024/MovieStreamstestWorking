# Movies Streaming App with Bunny CDN

## Overview

This is a web-based movie streaming application that integrates with Bunny CDN for content delivery. The application provides a custom video player with advanced error handling, debugging capabilities, and real-time monitoring. It's designed as a client-side application using vanilla JavaScript with Bootstrap for UI components and Feather icons for visual elements.

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