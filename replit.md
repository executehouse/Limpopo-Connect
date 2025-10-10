# Limpopo Connect

## Overview

Limpopo Connect is a community-focused Progressive Web Application (PWA) designed to connect people, businesses, and communities across South Africa's Limpopo Province. The platform serves as a comprehensive hub for local business discovery, event planning, marketplace transactions, tourism information, news updates, and social connections.

The application is built as a React-based single-page application with Supabase as the backend-as-a-service, providing authentication, real-time database capabilities, and user management. The platform emphasizes local community engagement through various features including a business directory, event calendar, marketplace, tourism hub, news feed, and unique connection features for fostering relationships.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 19.1.1 with TypeScript for type-safe component development
- Vite 7.1.7 as the build tool and development server
- React Router DOM 7.9.2 for client-side routing
- Tailwind CSS 3.4.17 for utility-first styling with custom Limpopo-themed color palette
- Lucide React for consistent iconography

**Component Structure:**
- Layout components (Header, Footer) provide consistent navigation and branding
- Page-level components for each major feature (Home, BusinessDirectory, Events, etc.)
- Reusable UI components (SEO, Breadcrumbs) for cross-cutting concerns
- Authentication context provider for global auth state management

**State Management:**
- React Context API for authentication state (AuthProvider)
- Custom hooks (useAuth, useRooms, useRoomMessages) for feature-specific state
- Local component state for UI interactions

**Routing Strategy:**
- Dynamic basename configuration using `import.meta.env.BASE_URL` for flexible deployment
- Protected routes for authenticated features (Profile, ChatDemo)
- Nested routing for connection sub-features

**Progressive Web App:**
- Service worker registration for offline capabilities
- Manifest.json for installable app experience
- Cache-first strategy for static assets

### Backend Architecture

**Supabase Integration:**
- Authentication system with email/password sign-in and registration
- PostgreSQL 17.6 database with comprehensive schema for chat, profiles, and business data
- Row Level Security (RLS) policies for data access control
- Database triggers for real-time message broadcasting and audit logging
- Edge Functions for server-side logic (post-message, summary-worker)

**Database Schema:**
- Core tables: profiles, rooms, room_members, message_threads, room_messages
- Audit and analytics: room_messages_audit, summary_jobs, thread_summaries
- Business features: businesses, reports
- Foreign key relationships enforcing data integrity
- Indexes optimized for common query patterns

**Real-time Features:**
- Supabase Realtime channels for live message updates
- Custom subscription helpers with type-safe payload handling
- Channel naming pattern: `room:{room_id}:messages`
- Broadcast triggers via database functions

**Authentication Flow:**
- Supabase Auth for user registration and session management
- Profile auto-creation via database trigger on new user signup
- JWT-based session tokens with automatic refresh
- Password reset flow with email verification

### Data Storage Solutions

**Primary Database:**
- Supabase PostgreSQL for relational data
- Tables with JSONB columns for flexible metadata storage
- Full-text search capabilities on relevant fields

**File Storage:**
- Azure Blob Storage integration for user-uploaded content (planned)
- Signed URL (SAS) flow for secure direct uploads
- User-specific folder structure: `/<auth.uid()>/*`

**Local Development:**
- Mock data services for offline development
- LocalStorage for "Remember Me" functionality and client-side preferences

### Authentication & Authorization

**Authentication Mechanisms:**
- Supabase Auth with email/password provider
- Session-based authentication with refresh tokens
- OAuth providers supported but not yet implemented

**Authorization Model:**
- Role-based access control (roles: citizen, business, admin)
- Row Level Security policies enforce data access rules
- User owns their profile data
- Room membership controls message access
- Admin and member roles within chat rooms

**Security Measures:**
- Input sanitization to prevent XSS attacks
- Parameterized queries via Supabase client (prevents SQL injection)
- HTTPS-only communication enforced
- Content Security Policy headers configured
- Password strength validation on client and server

### External Dependencies

**Core Services:**
- **Supabase** (supabase.co): Backend-as-a-Service providing authentication, PostgreSQL database, real-time subscriptions, and Edge Functions
  - Project URL configured via `VITE_SUPABASE_URL`
  - Anonymous key via `VITE_SUPABASE_ANON_KEY`
  - Local development using Supabase CLI

**Third-Party Libraries:**
- **@supabase/supabase-js** (2.31.0): Official Supabase JavaScript client
- **lucide-react** (0.544.0): Icon library for consistent UI elements
- **express** (4.18.2): Node.js server for production deployment proxy
- **http-proxy-middleware** (2.0.6): API request proxying in development and production

**Development Tools:**
- **Vitest** (3.2.4): Unit testing framework with jsdom environment
- **@testing-library/react** (16.3.0): React component testing utilities
- **ESLint** (9.36.0) with TypeScript support: Code quality enforcement
- **gh-pages** (6.3.0): Automated GitHub Pages deployment

**Build & Deployment:**
- GitHub Actions for CI/CD pipeline
- Vercel-ready configuration with rewrites for SPA routing
- GitHub Pages deployment with custom base path handling

**APIs & Integrations:**
- Mock data services for development (mockData.ts)
- Planned integration with Azure services for production file storage
- RESTful API pattern with `/api` prefix for backend calls
- Proxy configuration routing `/api/auth` to port 3001, `/api/businesses` to port 3002

**Environment Configuration:**
- Environment variables for Supabase credentials
- Different configurations for development, staging, and production
- `.env.local` for local development secrets
- GitHub Secrets for production deployment credentials