# Overview

This is a modern streaming media platform called "Madifa" built as a full-stack web application. The platform focuses on delivering video content "for the world with Africans at heart" and provides Netflix-like functionality including movie streaming, user watch history, performance monitoring, and user feedback systems. The application is designed for scalable video delivery with adaptive streaming capabilities and comprehensive analytics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **UI Framework**: Shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom design system variables for the Madifa brand
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API with structured route handling
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas for input validation and type safety
- **Development**: Hot reload with Vite integration in development mode

## Database Design
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Tables**:
  - `users`: User authentication and subscription management
  - `movies`: Video content metadata with quality URLs and streaming information
  - `watchHistory`: User viewing progress and completion tracking
  - `performanceMetrics`: Real-time streaming quality and performance data
  - `userFeedback`: User issue reporting and feedback system

## Video Streaming Features
- **Adaptive Streaming**: Multiple quality URLs (360p, 480p, 720p, 1080p) with automatic quality adjustment
- **Performance Monitoring**: Real-time tracking of buffer time, error rates, connection speed, and CDN latency
- **Content Organization**: Support for movies, series, documentaries, music, and theatre content types
- **Original Content**: Special handling and badging for platform-exclusive content

## Development and Deployment
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Path Aliases**: Organized import structure with @/ for client code and @shared for common types
- **Environment**: Replit-optimized with development tooling and error handling

# External Dependencies

## Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **drizzle-orm** & **drizzle-kit**: Type-safe database ORM and migration tools
- **@neondatabase/serverless**: Serverless PostgreSQL connection with WebSocket support

## UI and Styling
- **@radix-ui/***: Comprehensive set of unstyled UI primitives (accordion, dialog, dropdown, etc.)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **clsx** & **tailwind-merge**: Conditional CSS class utilities

## Form and Validation
- **react-hook-form**: Performant form handling
- **@hookform/resolvers**: Form validation resolver integration
- **zod**: Schema validation and TypeScript inference
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation

## Development Tools
- **vite**: Fast build tool and development server
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error handling for Replit
- **tsx**: TypeScript execution for development scripts
- **@types/node**: Node.js TypeScript definitions

## Additional Features
- **date-fns**: Date manipulation and formatting
- **embla-carousel-react**: Touch-friendly carousel/slider component
- **cmdk**: Command palette and search functionality
- **lucide-react**: Feather-inspired icon library