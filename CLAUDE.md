# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rankly is an AI Engine Optimization (AEO) platform that analyzes and scores websites based on their visibility across AI search engines (ChatGPT, Claude, Perplexity, Google). Built with Next.js 15, TypeScript, PostgreSQL/Prisma, and integrates multiple AI providers with Stripe subscription payments.

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
- **Provider implementations**: OpenAI, Anthropic, Perplexity, Google models in `src/lib/ai-models/`
- **Prompt management**: Centralized templates in `src/prompts/` organized by system/user prompts

### Analysis Engines
- **AnalyticalEngine** (`src/engines/AnalyticalEngine.ts`) - Orchestrates query generation and execution across AI providers with per-query point scoring system
- **RankingEngine** (`src/engines/RankingEngine.ts`) - Implements AEO scoring algorithms with per-query point system:
  - Normal queries: max 10 points each
  - Direct business queries: max 4 points each (25% of normal scoring)
  - Direct sum of relevance scores (no double-counting of position factors)

### Service Layer
- **AEOAnalysisService** - Main orchestration service for AEO analysis workflow with cron support
- **WebsiteAnalysisService** - Website content extraction and business information parsing
- **WordPositionAnalysisService** - Ranking position analysis and competitor identification
- **RecurringScansService** - Manages automated recurring analysis with subscription tier validation
- **Background Job System** - Asynchronous processing for website analysis with job tracking and status polling

### Database Design (Prisma)
- **Organization model**: Multi-tenant structure for grouping users and businesses
- **Business model**: URL-driven with websiteUrl unique constraint, recurring scan settings
- **User model**: Authentication, subscription management, rate limiting, linked to Organization
- **AeoScore**: Historical score tracking linked to Business
- **InputHistory/RankingHistory/QueryResults**: Complete audit trail linked by `runUuid` and Business
- **AnalysisJob**: Background job tracking for asynchronous website analysis with progress monitoring
- **Rate limiting**: Separate tracking for website analysis vs prompt generation

## Key Implementation Details

### Authentication & Authorization
- NextAuth.js with Prisma adapter
- Session-based authentication with multiple providers
- Subscription tiers: free (1/day), indie (3/day + recurring scans), professional (unlimited), enterprise (unlimited + consultation)

### Subscription Management (Stripe)
- **Stripe Checkout** for secure payment processing
- **Stripe Subscriptions API** for recurring monthly payments
- **Stripe Customer Portal** for subscription management
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
- `analyze-url-async/` - Background website analysis with job tracking (POST: create job, GET: check status)
- `dashboard/execute-analysis-async/` - Manual analysis job tracking (POST: create job, GET: check job status by businessId)
- `dashboard/query-results/` - Query results with pagination support (latestRunOnly parameter for most recent analysis)
- `auth/` - NextAuth.js authentication routes
- `subscriptions/` - Stripe subscription management (create, cancel, update, webhooks)
- `cron/recurring-scans/` - Automated recurring analysis endpoint
- `usage-check/` - Rate limiting validation with usage limit display
- `dashboard/` - Dashboard-specific endpoints (organizations, businesses, ranking history, recurring scans)

### Components (`src/components/`)
- Organized by page/feature (home/, auth/, dashboard/, payment/)
- Dashboard components: AutomationSetupTab (recurring scans), TrendsTab (with query pagination), ExecuteTabSimple (with job persistence), LinkWebsiteTab (with usage limits)
- **Job Persistence**: Manual analysis continues across tab switches with automatic job resumption
- **Query Pagination**: TrendsTab shows paginated queries from latest analysis run only (10 per page)
- **Graph Filtering**: Invalid zero-value data points filtered from trend charts
- Payment components: SubscriptionFlow, StripeCardForm (Stripe Checkout)
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
- `GOOGLE_AI_API_KEY` - Google AI integration
- `STRIPE_SECRET_KEY` - Stripe API access
- `STRIPE_PUBLISHABLE_KEY` - Stripe frontend integration
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification
- `CRON_SECRET` - Vercel cron job authentication

## Development Guidelines

### TypeScript Best Practices
- **Always use enums for string constants**: When dealing with predefined string values (like subscription status, user roles, etc.), always import and use the appropriate enum instead of hardcoding strings
  - Example: Use `SubscriptionStatus.CANCELED` instead of `'canceled'`
  - This ensures type safety and prevents typos
- **Type imports**: Import types/enums from their source files rather than using string literals

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
- **Subscription Tiers**: Integrated Stripe payments with tier-based feature access
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

#### Stripe Subscription System (Complete)
- **Payment Infrastructure** - Full Stripe subscription integration with Stripe Checkout
- **Subscription Plans** - Indie ($20), Professional ($75), Enterprise ($250) tiers with database seeding
- **Payment Components** - SubscriptionFlow and StripeCardForm components with dark theme
- **API Endpoints** - Complete subscription creation, cancellation, and plan fetching
- **Subscription Sync** - Daily cron job to sync subscription statuses with Stripe (pseudo-webhook)

#### Database Schema for Subscriptions (Complete)
- **User subscription fields** - subscriptionId, subscriptionStatus, subscriptionStartDate, etc.
- **SubscriptionPlan table** - Centralized plan management with pricing and features
- **Automatic downgrading** - Users moved to free tier when subscriptions become inactive

#### Subscription Status Sync System (Complete)
- **Daily cron job** at 2 AM to check all subscription statuses against Stripe
- **SubscriptionSyncService** - Comprehensive service for subscription status management
- **Manual sync endpoint** - `/api/admin/sync-subscription` for testing and admin use
- **Status handling** - Automatic downgrade on canceled, past_due, incomplete, or expired subscriptions

#### Automation Features (Complete)
- **Recurring scans** - Backend system with Vercel cron job for automated AEO analysis
- **Automation Setup tab** - Dedicated UI for managing recurring scan settings
- **Tier-based access** - Recurring scans available for Indie+ subscribers only
- **Multiple frequencies** - Daily, weekly, monthly scan options

#### Current Production Status
- **Build successful** with all TypeScript issues resolved
- **Stripe integration** fully functional with checkout flow
- **Complete payment flow** from plan selection to subscription creation
- **Comprehensive error handling** and user feedback throughout

#### Environment Configuration Required
- Stripe API credentials (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY)
- STRIPE_WEBHOOK_SECRET for webhook signature verification
- CRON_SECRET for secure cron job authentication

#### Latest Enhancements (January 2025)

##### Mobile & UX Improvements (Complete)
- **Mobile Dashboard** - Fixed sidebar menu to properly close after tab selection on mobile devices
- **Dashboard Code Cleanup** - Removed hardcoded conditions preventing proper "No Websites Found" state display
- **Responsive Design** - Enhanced mobile experience with proper touch interactions and menu behavior

##### Background Processing System (Complete)
- **Asynchronous Website Analysis** - New `AnalysisJob` model for tracking long-running analysis operations
- **Background API Endpoint** - `/api/analyze-url-async` for non-blocking website linking and analysis
- **Job Status Polling** - Real-time progress updates with automatic status checking every second
- **Session Persistence** - Users can navigate away during analysis; jobs continue running in background
- **Robust Error Handling** - Comprehensive error tracking and recovery for background operations

##### Enhanced Usage Limits Display (Complete)
- **Real-time Usage Monitoring** - Live display of daily analysis limits and 5-minute rate limits
- **Visual Progress Indicators** - Progress bars and status badges showing current usage vs. limits
- **Tier-based Information** - Clear indication of subscription tier capabilities and restrictions
- **Rate Limit Explanations** - Educational tooltips explaining daily limits vs. rate limiting windows

##### Advanced Prompt Generation (Complete)
- **Optimized Query Count** - Refined to 4 targeted analysis queries per business for focused coverage
- **Direct Business Queries** - Added targeted queries that specifically mention the business name
- **Smart Scoring System** - Reduced scoring for direct business queries while maintaining balanced analysis
- **Industry-Focused Prompts** - Enhanced prompt quality with direct "top companies" and "industry leaders" targeting
- **Improved Query Templates** - More specific language designed to surface industry leaders and top performers

##### Prompt Quality & Targeting Improvements (Complete)
- **Strategic Query Design** - Queries now focus on "Who leads the X market?" and "Which X companies are most trusted?"
- **Company Discovery Optimization** - Prompts specifically designed to surface top companies and industry leaders
- **Enhanced Fallback Queries** - Improved backup prompt templates with company-focused language
- **Location-Aware Queries** - Smart geographic targeting when location data is available
- **Authority-Based Questions** - Queries targeting expertise, reputation, and market leadership

#### Current Production Status
- **Build successful** with all TypeScript issues resolved
- **Background processing** fully operational with job persistence
- **Enhanced prompt system** generating 4 targeted queries with direct business targeting
- **Mobile-optimized** dashboard with improved UX and navigation
- **Comprehensive usage tracking** with real-time limit displays

##### Latest Session Improvements (August 2025)

###### Performance Optimization - Full Parallel AI Execution (Complete)
- **Complete Parallelization** - All analysis services now use `analyzeWithCustomQueriesParallel()` method
- **Matrix Parallel Processing** - 4 providers × 4 queries = 16 concurrent API calls instead of sequential execution
- **Dramatic Speed Improvement** - Reduced from 28 sequential API calls to 16 parallel calls (~16x faster, limited by slowest API response)
- **Dual-Level Concurrency** - Both AI providers AND queries within each provider run in parallel simultaneously
- **Robust Error Handling** - Individual query/provider failures don't block other operations
- **Progress Tracking** - Real-time updates as each provider completes analysis

###### Smart Location-Based Query Generation (Complete)
- **Industry Classification** - Comprehensive list of location-independent industries (technology, software, banking, etc.)
- **Intelligent Location Filtering** - Automatically skips location queries for national/global industries
- **Location-Dependent Industries** - Preserves location queries for brick-and-mortar businesses (restaurants, retail, law firms)
- **Industries Excluded from Location**:
  - Technology, Software, SaaS, Cloud Computing
  - Banking, Finance, FinTech, Insurance
  - E-commerce, Digital Marketing, SEO
  - AI/ML, Cybersecurity, Blockchain
  - Consulting, Analytics, Enterprise Software
  - And 50+ other digital/global industries
- **Debug Logging** - Clear indicators when location is skipped for specific industries

##### Latest Session Improvements (August 2025)

###### Manual Analysis Job Persistence (Complete)
- **Cross-Tab Job Continuity** - Manual analysis jobs persist across tab navigation, automatically resume monitoring on component mount
- **Job Status Polling** - ExecuteTabSimple checks for existing jobs when businessId changes and resumes progress tracking
- **Background Job Query** - `/api/dashboard/execute-analysis-async` supports querying jobs by businessId for job resumption
- **Cleanup Handling** - Proper polling cleanup on component unmount to prevent memory leaks

###### Query Analysis Pagination (Complete)
- **Latest Run Focus** - TrendsTab shows only queries from the most recent analysis run with `latestRunOnly=true` parameter
- **Paginated Results** - 10 queries per page with full pagination controls and metadata
- **Performance Optimization** - Efficient query filtering by latest runUuid to reduce database load
- **User Experience** - Clear pagination indicators showing "Page X of Y" and total query count

###### Scoring System Overhaul (Complete)
- **Per-Query Point System** - Each query can contribute max 10 points (normal) or 4 points (direct business queries)
- **Direct Query Reduction** - Direct business queries score 25% of normal (0.25x multiplier) to prevent gaming
- **Eliminated Double-Counting** - Removed duplicate position scoring in RankingEngine, uses only AnalyticalEngine relevance scores
- **Scaled Point Distribution** - Total possible score: 34 points (3×10 + 1×4) for typical 4-query analysis
- **Consistent Scoring** - All historical scoring inconsistencies resolved with proper point scaling

###### Graph Data Filtering (Complete)
- **Invalid Data Filtering** - TrendsTab filters out data points where all ranking values are 0 (invalid historical data)
- **Visual Clarity** - Charts now show only valid data points, improving trend visualization
- **Data Validation** - Checks for `(openaiRank || 0) > 0` across all AI providers before displaying data points

###### Usage Limit Integration (Complete)
- **LinkWebsiteTab Enhancement** - Usage display matches ExecuteTabSimple pattern with simplified UI
- **Button State Management** - Link and analyze button disabled when daily usage limit reached (`!usageInfo?.canUse`)
- **Consistent UX** - Removed complex usage limits display section for cleaner interface
- **Real-time Updates** - Usage information fetched and displayed in real-time

###### Staged Background Processing System (Complete)
- **Replaced Cron Jobs** - Migrated from Vercel cron jobs to server-side background task manager
- **BackgroundTaskManager** - Singleton service that manages polling tasks with 10-second intervals
- **Three-Stage Pipeline** - Split analysis into: website extraction → prompt generation → AI analysis
- **Server Initialization** - Automatic startup via Next.js instrumentation hook (`src/instrumentation.ts`)
- **Graceful Shutdown** - Proper cleanup on SIGTERM/SIGINT signals
- **Default Enabled** - Background tasks run by default, set `ENABLE_BACKGROUND_TASKS=false` to disable
- **Job Locking System** - Only one job processes at a time per stage with `inProgress` column
- **Admin API** - `/api/admin/background-tasks` for manual control (start/stop/run-once)
- **No Lost Jobs** - Robust error handling and retry logic with job status tracking
- **Atomic Processing** - Each stage locks, processes, and unlocks jobs to prevent conflicts

###### Technical Implementation Details
- **StagedAnalysisService** - Refactored analysis flow into separate methods for each stage
- **Job State Management** - Enhanced AnalysisJob model with `currentStep`, `retryCount`, and `inProgress` fields
- **Optimistic Locking** - Uses `updateMany` with `inProgress=false` condition to prevent race conditions
- **Manual Analysis Support** - Handles both website analysis and manual analysis workflows
- **TypeScript Safety** - Proper type definitions for all background task interfaces
- **Error Recovery** - Jobs can fail and retry at any stage without losing progress
- **Performance Optimization** - Staggered processing (0s, +3s, +6s offsets) to reduce server load
- **Single Job Processing** - Each processor locks and processes only one job at a time per stage

###### Homepage AEO Messaging Improvements (Complete)
- **Clear Value Proposition** - Updated hero section to "Track Your Brand's AI Engine Visibility"
- **AEO Terminology Integration** - Consistently uses "Answers Engine Optimization" throughout homepage
- **Brand Visibility Focus** - Emphasizes tracking how AI engines recommend businesses vs competitors
- **AI Engine Coverage** - Highlights ChatGPT, Claude, Perplexity, Google AI Overviews monitoring
- **GEO Integration** - Incorporates Generative Engine Optimization and AI search optimization keywords
- **Professional Positioning** - Updated messaging for "Professional AEO Reports for Brands & Businesses"

###### Seamless Homepage-to-Analysis Flow (Complete)
- **Pre-Login URL Storage** - WebsiteAnalysisInput stores intended analysis URL in localStorage before login
- **Smart Login Redirection** - LoginModal uses stored URL as redirect destination after authentication
- **Post-Login Navigation** - Homepage automatically redirects to stored dashboard URL after successful login
- **Automatic Analysis Start** - Dashboard receives analyzeUrl/autoStart parameters and immediately begins website analysis
- **Zero-Business Dashboard Fix** - Removed broken "No Websites Found" screen, automatically shows Link Website tab

###### User Experience Improvements (Complete)
- **Broken State Elimination** - Dashboard with 0 businesses now works seamlessly without placeholder screens
- **Smooth Analysis Flow** - Click "Analyze Your Site" → Login → Dashboard with analysis running automatically
- **Consistent Branding** - All terminology aligned with AEO/GEO/Answers Engine Optimization throughout
- **Mobile-Optimized** - Login and analysis flow works properly across all device sizes

##### Latest Session Improvements (August 2025 - Current)

###### Query Count Optimization & Full Parallelization (Complete)
- **Reduced Query Count** - Optimized from 7 to 4 queries per provider for faster, more focused analysis
- **Environment Configuration** - Updated `MAX_AEO_QUERIES` from "7" to "4" in environment variables
- **Scoring System Update** - Adjusted theoretical max from 64 to 34 points (3×10 + 1×4) with proper scaling
- **API Optimization** - Updated manual prompt generation from 10 to 4 prompts for consistency
- **Complete Parallel Adoption** - Fixed both AEOAnalysisService and StagedAnalysisService to use parallel execution
- **Performance Gains** - 4 providers × 4 queries = 16 parallel API calls instead of sequential processing
- **Cost Reduction** - 43% fewer AI API calls while maintaining comprehensive competitive intelligence
- **Maintained Quality** - Preserved direct business queries and core competitive analysis coverage

#### Current Production Status (August 2025)
- **Build Successful** - All TypeScript errors resolved with optimized query system
- **Full Parallelization** - 16 concurrent API calls (4 providers × 4 queries) for maximum performance
- **Optimized Query Count** - Reduced to 4 targeted queries per provider for cost efficiency
- **Updated Subscription System** - New pricing structure ($20/$100/$300) with weekly manual scan limits
- **Complete Background Processing** - Staged analysis system with job persistence and resumption
- **Mobile-Responsive Dashboard** - Full UX optimization across all device sizes

#### Next Steps for Production
- Configure production Stripe API credentials and webhook endpoints
- Test complete subscription flow with new pricing structure in production
- Monitor parallel AI API performance and implement provider-specific rate limiting if needed
- A/B test reduced query count effectiveness vs. previous 7-query system
- Implement advanced analytics for 4-query analysis performance across business types
- Consider dynamic query count based on subscription tier (e.g., Enterprise gets more queries)
- Monitor weekly manual scan usage patterns and optimize limits if needed
- Set up production monitoring for the 16-parallel-call system performance