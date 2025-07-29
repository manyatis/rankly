# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rankly is an AI Engine Optimization (AEO) platform that analyzes and scores websites based on their visibility across AI search engines (ChatGPT, Claude, Perplexity). Built with Next.js 15, TypeScript, PostgreSQL/Prisma, and integrates multiple AI providers.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Code quality checks
npm run lint

# Testing
npm run test               # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report

# Database operations
npx prisma generate       # Generate Prisma client
npx prisma db push        # Push schema changes
npx prisma studio         # Database browser
```

## Core Architecture

### Multi-AI Provider System
- **ModelFactory** (`src/lib/ai-models/ModelFactory.ts`) - Central factory for AI provider instantiation
- **BaseAIModel** - Abstract base class for all AI providers
- **Provider implementations**: OpenAI, Anthropic, Perplexity models in `src/lib/ai-models/`
- **Prompt management**: Centralized templates in `src/prompts/` organized by system/user prompts

### Analysis Engines
- **AnalyticalEngine** (`src/engines/AnalyticalEngine.ts`) - Orchestrates query generation and execution across AI providers
- **RankingEngine** (`src/engines/RankingEngine.ts`) - Implements AEO scoring algorithms with weighted factors:
  - Position ranking (50%)
  - Visibility across queries (30%) 
  - Word count/relevance (20%)

### Service Layer
- **AEOAnalysisService** - Main orchestration service for AEO analysis workflow
- **WebsiteAnalysisService** - Website content extraction and business information parsing
- **WordPositionAnalysisService** - Ranking position analysis and competitor identification

### Database Design (Prisma)
- **Organization model**: Multi-tenant structure for grouping users and businesses
- **Business model**: Stores website/business info with unique constraint on `websiteName + organizationId`
- **User model**: Authentication, subscription tiers, rate limiting, linked to Organization
- **AeoScore**: Historical score tracking linked to Business
- **InputHistory/RankingHistory**: Complete audit trail linked by `runUuid` and Business
- **Rate limiting**: Separate tracking for website analysis vs prompt generation

## Key Implementation Details

### Authentication & Authorization
- NextAuth.js with Prisma adapter
- Session-based authentication with multiple providers
- Subscription tiers: free, professional, enterprise with different usage limits

### Rate Limiting Strategy
- Daily usage tracking per user
- 5-minute sliding windows for intensive operations
- Feature-specific limits (analyze website, generate prompts)
- Usage validation in API routes before processing

### AI Integration Patterns
- All AI calls happen server-side for security
- Provider abstraction allows easy addition of new AI services
- Prompt templates ensure consistent analysis across providers
- Error handling and fallbacks for provider failures

### Testing Strategy
- Jest with jsdom environment for React components
- Testing Library for component interaction testing
- API route testing with mocked AI providers
- Database operations tested with test database

## File Structure Conventions

### API Routes (`src/app/api/`)
- `aeo-score/` - Core AEO analysis endpoint
- `auth/` - NextAuth.js authentication routes
- `payments/` - Square payment integration
- `usage-check/` - Rate limiting validation
- `dashboard/` - Dashboard-specific endpoints for organizations, businesses, ranking history, etc.

### Components (`src/components/`)
- Organized by page/feature (home/, auth/, dashboard/)
- Reusable UI components at root level (Navbar, Footer, LoginModal)
- Dashboard components in `dashboard/` subdirectory (TrendsTab, BusinessInfoTab, PromptsTab, ExecuteTab)
- Follow React 19 patterns with server/client component separation

### Services (`src/services/`)
- Business logic separated from API routes
- Each service handles specific domain (AEO analysis, website analysis, etc.)
- Stateless services that can be easily tested

## Environment Setup

Required environment variables:
- `DATABASE_URL` / `DIRECT_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL` - Authentication
- `ANTHROPIC_API_KEY` - Claude integration
- `OPENAI_API_KEY` - ChatGPT integration
- `PERPLEXITY_API_KEY` - Perplexity integration
- Square payment keys for subscription handling

## Development Guidelines

### Adding New AI Providers
1. Extend `BaseAIModel` class
2. Implement provider-specific API integration
3. Add to `ModelFactory.createModel()` switch statement
4. Update type definitions in `src/types/`

### Database Schema Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma db push` for development
3. Generate new Prisma client with `npx prisma generate`
4. Update related TypeScript types

### Testing New Features
- Unit tests for services and utilities
- Integration tests for API routes
- Component tests for React components
- Mock external dependencies (AI providers, payments)

### Prompt Engineering
- System prompts in `src/prompts/system/`
- User prompts in `src/prompts/user/`
- Query variations in `src/prompts/query-variations/`
- Test prompt changes across all supported AI providers

## Recent Major Updates (Latest Session)

### Dashboard Implementation (Complete)
- **New dashboard page** at `/dashboard` with dark theme matching home page
- **Multi-tenant organization system** - Each user gets "My Org" on signup
- **Business management** - Create/edit businesses within organizations
- **Four main tabs**: Trends (ranking history), Business Info, Prompts (history), Execute (new analysis)

### Database Schema Restructure (Complete)
- **Added Organization table** - Groups users and businesses
- **Added Business table** - Stores website info with unique constraint per organization
- **Updated all related tables** - AeoScore, InputHistory, RankingHistory now reference Business
- **Automatic organization creation** - New users get "My Org" created on first login via NextAuth callback

### Authentication & User Flow (Complete)
- **Improved login experience** - Dashboard shows proper login modal instead of redirect
- **Auto-organization assignment** - Users automatically get "My Org" on signup
- **Consistent navigation** - Added "Dashboard2" to navbar, Footer component for all pages

### Current State & Next Steps
- **Dashboard is functional** with organization/business dropdowns and tab navigation
- **Execute Analysis buttons** have debugging console logs to track functionality
- **All components use dark theme** consistent with rest of application
- **Database migration completed** - All existing data properly linked to new structure

### Known Issues & Potential Next Steps
- May need to test Execute Analysis button functionality and AEO score integration
- Could add business creation directly from dashboard sidebar for better UX
- Might want to add organization management (rename, delete, invite users)
- Consider adding bulk business import/export functionality