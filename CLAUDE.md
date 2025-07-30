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

## Recent Major Updates

### Architecture Transformation (December 2024)
Complete redesign from business-name-driven to URL-driven multi-tenant platform:

#### **Backend Infrastructure Changes**
- **Efficient Competitor Analysis**: Modified `analyzeProviders()` to score main business + competitors from same AI query results
- **User-Agnostic Data Storage**: Made `InputHistory` and `RankingHistory` userId-optional for cross-organization data sharing
- **URL-Based Workflow**: Created `/api/analyze-url` endpoint for automatic business info extraction from website URLs
- **Immutable Business Model**: Disabled business editing (PUT returns 405) to ensure data consistency
- **Smart Unlinking System**: Changed DELETE to unlink via `OrganizationBusiness` relationships, preserving all data
- **URL as Primary Key**: Switched unique constraint from `websiteName` to `websiteUrl`
- **Automatic Data Inheritance**: Users linking to existing websites inherit all historical ranking data
- **Simplified Execution**: Created `/api/dashboard/execute-analysis` for one-click analysis using stored data

#### **Database Schema Evolution**
- **Organization Model**: Multi-tenant structure linking users and businesses
- **Business Model**: URL-driven with `websiteUrl` unique constraint, `isCompetitor` flag for standalone competitor tracking
- **Competitor Relationships**: Bidirectional `Competitor` table linking businesses
- **Historical Preservation**: `RankingHistory` stores competitor scores alongside main business scores
- **Cross-Organization Sharing**: Businesses can be tracked by multiple organizations simultaneously

#### **AI Integration Improvements**
- **Competitor Service**: Enhanced `parseCompetitorResponse()` with robust JSON parsing strategies
- **Business Info Extraction**: `WebsiteAnalysisService.extractBusinessInfo()` auto-extracts company details from URLs
- **Smart Prompt Management**: Stored prompts reused or auto-generated as fallback
- **Top 8 Competitor Tracking**: Automatic competitor identification and ranking during analysis

### Dashboard UI Transformation (December 2024)

#### **Website-Centric Interface**
- **Read-Only Website Info**: Business details immutable with prominent URL display
- **Unlink vs Delete**: Orange "Unlink Website" button preserves data for other organizations
- **URL Prominence**: Website URLs displayed prominently with clickable links
- **Website Labeling**: Changed all "Business" references to "Website" throughout interface

#### **Simplified Analysis Workflow**
- **One-Click Analysis**: Replaced multi-step form with single "Run AEO Analysis" button
- **Smart Data Usage**: Automatically uses stored prompts/business info or generates new ones
- **ExecuteTabSimple**: New streamlined component replacing complex workflow
- **Progress Feedback**: Clear loading states and success/error messaging

#### **New Competitors Tab**
- **Side-by-Side Comparison**: Main website vs top 8 competitors with color-coded rankings
- **Visual Hierarchy**: Blue border for main website, numbered competitor list
- **Score Visualization**: Green (excellent) to red (poor) ranking indicators
- **Confidence Matching**: AI confidence levels for competitor identification
- **Empty State Guidance**: Helpful messaging when no competitors found

#### **Navigation & UX**
- **Five-Tab Interface**: Trends, AI Insights, Website Info, Competitors, Prompts, Manual Analysis
- **Smart Dropdowns**: Website selection with auto-link for existing websites
- **Responsive Design**: Mobile-optimized with sidebar collapse
- **Status Indicators**: Website count limits and tier information

### Current State (December 2024)
- **Fully Functional Multi-Tenant Platform**: URL-driven with cross-organization data sharing
- **Automated Competitor Analysis**: AI identifies and tracks top 8 competitors automatically
- **Streamlined User Experience**: One-click analysis with intelligent data reuse
- **Data Preservation Architecture**: No data loss, websites persist across organization changes
- **Professional Dashboard**: Complete competitor intelligence interface

### Technical Architecture
- **Centralized Website Tracking**: Single source of truth for website data across all organizations
- **Efficient AI Usage**: Competitors scored from same query results as main business
- **Smart Data Inheritance**: Historical data automatically available when linking existing websites
- **Robust Parsing**: Multiple fallback strategies for AI response processing
- **Cross-Organization Analytics**: Competitor data shared intelligently across tenants

### Next Potential Enhancements
- Enhanced competitor discovery algorithms
- Bulk website import/export functionality
- Advanced competitor trend analysis
- Organization management features (rename, delete, invite users)
- Automated competitor monitoring and alerts