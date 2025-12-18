# StatsTree - Statistical Test Selection Tool

## Overview

StatsTree is an interactive web application that helps researchers select the appropriate statistical test based on their research goals, data structure, and study design. The tool guides users through a multi-step wizard interface, asking questions about their analysis needs and recommending suitable statistical tests with detailed information about assumptions, use cases, and alternatives.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: React Query (@tanstack/react-query) for server state, local React state for UI state
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints prefixed with `/api`
- **Development**: tsx for TypeScript execution, Vite dev server integration for HMR

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for shared type definitions
- **Current Storage**: In-memory storage implementation (`MemStorage` class) with interface for easy database migration
- **Database Config**: Drizzle Kit configured for PostgreSQL with migrations in `/migrations`

### Application Pages
1. **Home** (`/`) - Landing page with feature overview
2. **Wizard** (`/wizard`) - Multi-step question flow for test selection
3. **Results** (`/results`) - Displays recommended tests based on wizard answers
4. **All Tests** (`/tests`) - Browse and search all statistical tests
5. **Flowchart** (`/flowchart`) - Interactive decision tree with progressive disclosure

### Progressive Disclosure Flowchart
- **WizardContext**: Shared state between Wizard and Flowchart tracking user selections
- **Progressive Revelation**: Initially shows only start node + 6 research goals; clicking reveals children
- **Branch Switching**: Automatically truncates path when selecting a sibling node at same depth
- **Breadcrumb Navigation**: Header displays current selection path with "Start Over" reset
- **Test Detail Sheet**: Clicking test nodes opens side panel with statistical test details

### Key Design Patterns
- **Wizard Pattern**: Step-by-step question flow with progress tracking and back navigation
- **Decision Tree Logic**: `getRecommendedTests()` function in `statsData.ts` maps user selections to appropriate tests
- **Component Composition**: Reusable components (SelectionCard, WizardQuestion, TestResultCard) with example implementations
- **Path Aliases**: `@/` for client source, `@shared/` for shared modules, `@assets/` for attached assets

### Styling Approach
- Design inspired by Linear and Notion (clean, minimal, professional)
- Typography: Inter (primary), IBM Plex Mono (code/test names)
- Consistent spacing using Tailwind units (3, 4, 6, 8, 12, 16)
- CSS variables for colors enabling dark mode toggle

## External Dependencies

### UI Framework
- **Radix UI**: Full suite of accessible, unstyled primitives (accordion, dialog, dropdown, tooltip, etc.)
- **shadcn/ui**: Pre-built component styling on top of Radix
- **class-variance-authority**: Component variant management
- **Lucide React**: Icon library

### Database & ORM
- **Drizzle ORM**: TypeScript-first ORM for PostgreSQL
- **drizzle-zod**: Schema validation integration
- **pg**: PostgreSQL client
- **connect-pg-simple**: PostgreSQL session store (available for future session management)

### Development Tools
- **Vite**: Build tool with HMR
- **esbuild**: Production bundling for server
- **TypeScript**: Type checking across client and server

### Fonts (Google Fonts)
- DM Sans, Inter, Fira Code, Geist Mono, Architects Daughter