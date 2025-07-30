# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rankly is an AI Engine Optimization (AEO) platform that analyzes and scores websites based on their visibility across AI search engines (ChatGPT, Claude, Perplexity). Built with Next.js 15, TypeScript, PostgreSQL/Prisma, and integrates multiple AI providers with Square subscription payments.

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
- **AEOAnalysisService** - Main orchestration service for AEO analysis workflow with cron support
- **WebsiteAnalysisService** - Website content extraction and business information parsing
- **WordPositionAnalysisService** - Ranking position analysis and competitor identification
- **RecurringScansService** - Manages automated recurring analysis with subscription tier validation

### Database Design (Prisma)
- **Organization model**: Multi-tenant structure for grouping users and businesses
- **Business model**: URL-driven with websiteUrl unique constraint, recurring scan settings
- **User model**: Authentication, subscription management, rate limiting, linked to Organization
- **AeoScore**: Historical score tracking linked to Business
- **InputHistory/RankingHistory/QueryResults**: Complete audit trail linked by `runUuid` and Business
- **Rate limiting**: Separate tracking for website analysis vs prompt generation

## Key Implementation Details

### Authentication & Authorization
- NextAuth.js with Prisma adapter
- Session-based authentication with multiple providers
- Subscription tiers: free (1/day), indie (3/day + recurring scans), professional (unlimited), enterprise (unlimited + consultation)

### Subscription Management (Square)
- **Square Subscriptions API** for recurring monthly payments
- **Web Payments SDK** for secure card tokenization on frontend
- **Node.js SDK** for server-side subscription management
- **Webhook handling** for subscription lifecycle events
- **Tier-based feature access** enforced throughout application

### Automation System
- **Vercel Cron Jobs** (`/api/cron/recurring-scans`) run daily at 8 AM
- **Automated Analysis** for businesses with recurring scans enabled
- **Subscription Tier Validation** before processing recurring scans
- **AEOAnalysisService.runAnalysisForCron()** bypasses auth for automated execution
- **Frequency Options**: Daily, weekly, monthly with calculated next scan dates

### Rate Limiting Strategy
- Daily usage tracking per user with subscription tier limits
- 5-minute sliding windows for intensive operations
- Feature-specific limits (analyze website, generate prompts)
- Usage validation in API routes before processing

### AI Integration Patterns
- All AI calls happen server-side for security
- Provider abstraction allows easy addition of new AI services
- Prompt templates ensure consistent analysis across providers
- Error handling and fallbacks for provider failures

## File Structure Conventions

### API Routes (`src/app/api/`)
- `aeo-score/` - Core AEO analysis endpoint
- `auth/` - NextAuth.js authentication routes
- `subscriptions/` - Square subscription management (create, cancel, update, webhooks)
- `cron/recurring-scans/` - Automated recurring analysis endpoint
- `usage-check/` - Rate limiting validation
- `dashboard/` - Dashboard-specific endpoints (organizations, businesses, ranking history, recurring scans)

### Components (`src/components/`)
- Organized by page/feature (home/, auth/, dashboard/, payment/)
- Dashboard components: AutomationSetupTab (recurring scans), TrendsTab (with query results), ExecuteTab, etc.
- Payment components: PlanSelector, PaymentForm, SubscriptionManager
- Follow React 19 patterns with server/client component separation

### Services (`src/services/`)
- Business logic separated from API routes
- Each service handles specific domain (AEO analysis, website analysis, recurring scans, etc.)
- Stateless services that can be easily tested

## Environment Setup

Required environment variables:
- `DATABASE_URL` / `DIRECT_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL` - Authentication
- `ANTHROPIC_API_KEY` - Claude integration
- `OPENAI_API_KEY` - ChatGPT integration
- `PERPLEXITY_API_KEY` - Perplexity integration
- `SQUARE_ACCESS_TOKEN` - Square API access
- `SQUARE_APPLICATION_ID` / `SQUARE_LOCATION_ID` - Square configuration
- `SQUARE_ENVIRONMENT` - sandbox/production
- `CRON_SECRET` - Vercel cron job authentication

## Development Guidelines

### Database Schema Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma db push` for development
3. Generate new Prisma client with `npx prisma generate`
4. Update related TypeScript types

### Adding New AI Providers
1. Extend `BaseAIModel` class
2. Implement provider-specific API integration
3. Add to `ModelFactory.createModel()` switch statement
4. Update type definitions in `src/types/`

### Testing New Features
- Unit tests for services and utilities
- Integration tests for API routes
- Component tests for React components
- Mock external dependencies (AI providers, payments)

## Current State (January 2025)

### URL-Driven Multi-Tenant Platform
- **Centralized Website Tracking**: Single source of truth for website data across organizations
- **Cross-Organization Data Sharing**: Historical data automatically available when linking existing websites
- **Immutable Business Model**: Website details read-only to ensure data consistency across organizations
- **Smart Unlinking**: Preserves all data when users unlink websites from their organization

### Automation & Subscription System
- **Recurring Scans**: Automated AEO analysis for indie+ subscribers
- **Automation Setup Tab**: Dedicated interface for configuring recurring analysis
- **Subscription Tiers**: Integrated Square payments with tier-based feature access
- **Vercel Cron Integration**: Daily automated processing with proper error handling

### Advanced Analytics
- **Query Results Storage**: Complete visibility into AI search query responses
- **Competitor Intelligence**: Automatic identification and tracking of top 8 competitors
- **Trends Analysis**: Historical AEO score tracking with query-level insights
- **One-Click Analysis**: Streamlined workflow using stored business data

### Dashboard Interface
- **Six-Tab Navigation**: Automation Setup (top priority), Trends, AI Insights, Website Info, Competitors, Prompts, Manual Analysis
- **Professional UI**: Dark theme with comprehensive analytics and management tools
- **Mobile Responsive**: Optimized for all device sizes with collapsible sidebar
- **Real-time Updates**: Live subscription status, usage tracking, and analysis progress

### Technical Architecture Highlights
- **Efficient AI Usage**: Competitors scored from same query results as main business
- **Robust Error Handling**: Multiple fallback strategies for AI response processing
- **Security Best Practices**: PCI-compliant payments, server-side AI calls, proper authentication
- **Scalable Design**: Multi-tenant architecture ready for enterprise deployment

### Recent Major Updates (Current Session)

#### Square Subscription System (Complete)
- **Payment Infrastructure** - Full Square subscription integration with Web Payments SDK
- **Subscription Plans** - Indie ($20), Professional ($75), Enterprise ($250) tiers with database seeding
- **Payment Components** - PaymentForm and SubscriptionPlans components with dark theme
- **API Endpoints** - Complete subscription creation, cancellation, and plan fetching
- **Subscription Sync** - Daily cron job to sync subscription statuses with Square (pseudo-webhook)

#### Database Schema for Subscriptions (Complete)
- **User subscription fields** - subscriptionId, subscriptionStatus, subscriptionStartDate, etc.
- **SubscriptionPlan table** - Centralized plan management with pricing and features
- **Automatic downgrading** - Users moved to free tier when subscriptions become inactive

#### Subscription Status Sync System (Complete)
- **Daily cron job** at 2 AM to check all subscription statuses against Square
- **SubscriptionSyncService** - Comprehensive service for subscription status management
- **Manual sync endpoint** - `/api/admin/sync-subscription` for testing and admin use
- **Status handling** - Automatic downgrade on CANCELED, PAUSED, DEACTIVATED, EXPIRED

#### Automation Features (Complete)
- **Recurring scans** - Backend system with Vercel cron job for automated AEO analysis
- **Automation Setup tab** - Dedicated UI for managing recurring scan settings
- **Tier-based access** - Recurring scans available for Indie+ subscribers only
- **Multiple frequencies** - Daily, weekly, monthly scan options

#### Current Production Status
- **Build successful** with all TypeScript issues resolved
- **Mock Square client** in place (ready for production Square SDK configuration)
- **Complete payment flow** from plan selection to subscription creation
- **Comprehensive error handling** and user feedback throughout

#### Environment Configuration Required
- Square API credentials (SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, etc.)
- CRON_SECRET for secure cron job authentication
- Production Square environment configuration

#### Next Steps for Production
- Configure real Square API credentials and catalog items
- Replace mock Square client with production implementation
- Test complete payment flow in Square sandbox
- Set up proper webhook handling for real-time subscription events