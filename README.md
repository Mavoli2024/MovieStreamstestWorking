# Madifa Streaming Platform

A secure streaming platform for South African content with user authentication and video playback.

## Features

- 🔐 **Secure Authentication** - User registration and login system
- 🎬 **Video Streaming** - Protected video content for authenticated users
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🗄️ **Database Integration** - PostgreSQL with session management
- 🔄 **Real-time Monitoring** - Debug panel and logging system

## Technology Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **Frontend**: Vanilla JavaScript, Bootstrap 5
- **Video CDN**: Bunny CDN integration

## Quick Deploy to Replit

1. Fork this repository
2. Import to Replit
3. Set environment variables:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `SESSION_SECRET` (random secure string)
4. Run the application

## Local Development

```bash
npm install
npx tsx server/index.ts
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL database connection string
- `SESSION_SECRET` - Secret key for session management
- `PORT` - Server port (default: 5000)

## Authentication Flow

1. Users register at `/auth?tab=register`
2. Login at `/auth?tab=login`
3. Access protected video content after authentication
4. Session management with PostgreSQL storage

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/auth/user` - Get current user (protected)
- `GET /api/movies` - Get movie list (protected)

## Deployment

This app is configured for Replit Autoscale Deployments with:
- Automatic scaling based on traffic
- PostgreSQL database persistence
- HTTPS with SSL termination
- Session management across instances