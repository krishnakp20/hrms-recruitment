# HRMS Frontend

React-based frontend for the HRMS Recruitment System.

## Features

- Modern, responsive UI with Tailwind CSS
- Dashboard with key metrics and activities
- Employee management with search and filtering
- Candidate tracking with status management
- Job posting management
- Application tracking
- Authentication system

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Lucide React** - Icon library
- **Axios** - HTTP client

## Quick Start

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.jsx     # Main layout with sidebar
├── pages/             # Page components
│   ├── Dashboard.jsx  # Dashboard overview
│   ├── Employees.jsx  # Employee management
│   ├── Candidates.jsx # Candidate management
│   ├── Jobs.jsx       # Job management
│   ├── Applications.jsx # Application tracking
│   └── Login.jsx      # Authentication
├── services/          # API services
│   └── api.js         # HTTP client and API functions
├── App.jsx            # Main app component
├── main.jsx           # App entry point
└── index.css          # Global styles
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=HRMS Recruitment System
```

## Development

The frontend runs on `http://localhost:3000` by default and includes:

- Hot module replacement for fast development
- ESLint for code quality
- Tailwind CSS for styling
- Proxy configuration for API calls

## API Integration

The frontend communicates with the FastAPI backend through:

- **Axios** for HTTP requests
- **React Query** for data fetching and caching
- **JWT tokens** for authentication
- **Automatic error handling** and token refresh

## Styling

The application uses Tailwind CSS with:

- Custom color scheme (primary colors)
- Responsive design
- Component classes for consistency
- Dark mode support (ready for implementation)

## Components

### Layout
- Responsive sidebar navigation
- Mobile-friendly design
- Active route highlighting

### Pages
- **Dashboard**: Overview with stats and activities
- **Employees**: Table with search and filtering
- **Candidates**: Card-based layout with status badges
- **Jobs**: Grid layout with job details
- **Applications**: Table with application tracking
- **Login**: Authentication form

## Authentication

The app includes:

- Login form with validation
- JWT token storage
- Automatic token refresh
- Protected routes
- Logout functionality

## Build and Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The build output is optimized for production with:

- Code splitting
- Tree shaking
- Minification
- Asset optimization 