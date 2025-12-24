# Flex Living Reviews Dashboard

A comprehensive reviews management system for managing guest reviews across multiple properties. Built with NestJS (backend) and React + TypeScript (frontend), featuring PostgreSQL database integration, filtering, pagination, and approval workflows.

## About

This application provides a complete solution for managing property reviews:
- **Manager Dashboard**: View, filter, sort, and approve reviews across all properties
- **Public Display Pages**: Property-specific pages showing only approved reviews
- **Analytics**: Property statistics, average ratings, and category breakdowns
- **Multi-Channel Support**: Handle reviews from multiple sources (Hostaway, Google, etc.)

## Tech Stack

### Backend
- **NestJS** - Enterprise Node.js framework with TypeScript
- **PostgreSQL** - Relational database
- **TypeORM** - Object-Relational Mapping
- **Docker** - Database containerization

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client

## Features

- ✅ **Review Management**: View, filter, and sort reviews by multiple criteria
- ✅ **Approval Workflow**: Toggle approval status for public display
- ✅ **Property Analytics**: Aggregate statistics with category averages
- ✅ **Pagination**: Server-side pagination for reviews and client-side for properties
- ✅ **Advanced Filtering**: Filter by rating, category, channel, date range, property location
- ✅ **Database Indexing**: Optimized queries with database indexes
- ✅ **Multi-Channel Support**: Support for reviews from multiple sources
- ✅ **Responsive Design**: Modern UI with sticky sidebar and smooth scrolling

## Setup

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose

### Installation

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Setup database:**
   ```bash
   cd backend
   npm run setup:db
   ```
   
   This will:
   - Start PostgreSQL container (port 5434)
   - Seed the database with initial data

   Or manually:
   ```bash
   cd backend
   docker compose up -d
   npm run seed:run
   ```

### Running the Application

**From root directory (runs both backend and frontend):**
```bash
npm run dev
```

**Or run separately:**
```bash
# Terminal 1: Backend (http://localhost:3000)
npm run dev:backend

# Terminal 2: Frontend (http://localhost:5173)
npm run dev:frontend
```

### Access

- **Manager Dashboard**: http://localhost:5173/
- **Public Review Page**: http://localhost:5173/property/{propertyId}
- **API Swagger Docs**: http://localhost:3000/api/docs

## Database

The application uses PostgreSQL with the following entities:

- **Businesses**: Property information (sourceId, name, address, categories, etc.)
- **Users**: Review author information
- **Reviews**: Review data (rating, text, date, channel, type, approved status)
- **Review Categories**: Category-specific ratings (cleanliness, communication, etc.)

**Default Configuration:**
- Host: localhost
- Port: 5434
- Database: reviews_db
- Username: reviews_user
- Password: reviews_password

## Available Scripts

### Root
- `npm run dev` - Run both backend and frontend concurrently
- `npm run dev:backend` - Run backend only
- `npm run dev:frontend` - Run frontend only

### Backend
- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run setup:db` - Setup database (Docker + seed)
- `npm run seed:run` - Seed database with data
- `npm run migration:generate` - Generate new migration
- `npm run migration:run` - Run pending migrations

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
reviews/
├── backend/
│   ├── src/
│   │   ├── reviews/              # Reviews module (controller, service, DTOs)
│   │   ├── database/             # Database entities, migrations, seed scripts
│   │   ├── common/               # Shared utilities (logger, interceptors, filters)
│   │   └── main.ts               # Application entry point
│   ├── docker-compose.yml        # PostgreSQL Docker configuration
│   └── scripts/                  # Setup scripts
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Page components (Dashboard, ReviewDisplay)
│   │   ├── services/             # API service layer
│   │   ├── hooks/                # React Query hooks
│   │   └── types/                # TypeScript type definitions
│   └── public/                   # Static assets (favicon, etc.)
│
└── README.md
```

## API Endpoints

- `GET /api/reviews/hostaway` - Get reviews with filtering, sorting, and pagination
- `GET /api/reviews/properties` - Get property statistics
- `GET /api/reviews/approved/:propertyId?` - Get approved reviews (public)
- `GET /api/reviews/property/:propertyId` - Get property information
- `GET /api/reviews/channels` - Get distinct review channels
- `PATCH /api/reviews/:reviewId/approve` - Toggle review approval status

See Swagger documentation at http://localhost:3000/api for detailed API documentation.

## Google Reviews Integration – Findings

Google Reviews can be accessed through two official APIs, depending on ownership of the property listing.

Public reviews are available via the Google Places API, which allows retrieving reviews for locations listed on Google Maps using a Place ID. However, this API returns only the five most relevant reviews per location, requires billing to be enabled, and is subject to strict caching and data retention limitations. Due to these constraints, it is not suitable for comprehensive review aggregation or historical analysis.

Full review access is available through the Google Business Profile API, but only for properties owned or managed by the requesting account. This API requires OAuth 2.0 authentication, explicit approval from Google (which may take up to two weeks), and verified ownership of the business listing. It is designed for reputation management rather than third-party aggregation.

Conclusion:
A basic Google Reviews integration is technically feasible for demonstration purposes using the Places API, but it is not suitable for full review ingestion due to review count limits, billing requirements, and usage restrictions. For this reason, Google Reviews were not integrated into the core dashboard and are treated as an exploratory data source only.