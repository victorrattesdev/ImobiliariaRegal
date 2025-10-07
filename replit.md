# Real Estate Platform

## Overview

A modern real estate web application built for property listings and management. The platform features a clean, intuitive interface inspired by leading real estate platforms like Zillow and Realtor.com, focusing on visual appeal and user experience. The application supports both property browsing for end users and administrative management for property listing operations.

## Recent Changes

### September 13, 2025 - Enhanced Property Features and Localization
- **Car Spaces**: Added support for 1-4 car parking spaces selection in property forms and display
- **Strong Points**: Implemented comma-separated list input for property highlights with bulleted list display
- **Map Integration**: Added Google Maps embed URL field for interactive property location maps
- **Database Migration**: Successfully migrated to Replit environment with PostgreSQL database and proper schema versioning
- **Portuguese Localization**: Translated all property display text from English to Portuguese:
  - "Sale" → "Venda", "Rent" → "Aluguel"
  - "Active" → "Ativo", "Pending" → "Pendente", "Sold" → "Vendido"
  - "House" → "Casa", "Apartment" → "Apartamento", "Condo" → "Condomínio"

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Comprehensive component library built on Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Server**: Express.js with TypeScript support
- **API Design**: RESTful API with property CRUD operations and filtering capabilities
- **Database Layer**: Drizzle ORM for type-safe database operations
- **Connection Pooling**: Neon serverless PostgreSQL with connection pooling

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle migrations with schema versioning
- **Data Models**: 
  - Properties with comprehensive attributes (price, location, amenities, images)
  - Users for authentication and authorization
  - Relationship modeling between users and properties

### Component Architecture
- **Design System**: Modular component library with consistent spacing (Tailwind units)
- **Property Display**: Card-based layout with image galleries and detailed information
- **Search & Filtering**: Advanced filtering panel with location, price range, and property type filters
- **Admin Interface**: Comprehensive property management dashboard
- **Responsive Design**: Mobile-first approach with breakpoint-specific layouts

### Authentication and Authorization
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **User Management**: Basic username/password authentication system
- **Role-Based Access**: Separation between public property browsing and admin management

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Connection Management**: WebSocket-based connections for serverless environments

### UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **shadcn/ui**: Pre-built component library with consistent design patterns
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind integration

### Font and Asset Management
- **Google Fonts**: Inter font family for typography consistency
- **Asset Pipeline**: Vite-managed asset optimization and bundling

### Query and Form Management
- **TanStack Query**: Server state management, caching, and synchronization
- **React Hook Form**: Performant form handling with minimal re-renders
- **Zod**: TypeScript-first schema validation for forms and API contracts