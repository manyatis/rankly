# AEO Score Refactoring Instructions

## Overview
This app tracks analytics for AEO (AI Engine Optimization) for websites. Currently, all AI model logic is contained in `aeo-score/route.ts`, which needs to be refactored to support multiple AI providers.

## Current State
- **OpenAI Implementation**: Currently implemented in `queryOpenAI()` function within route.ts
- **Architecture Issue**: All model-specific logic is tightly coupled in the main route handler
- **Supported Models**: Only OpenAI GPT-4.1-mini with web search tools

## Refactoring Goals

### 1. Create Modular Architecture
- Extract model logic into separate classes
- Create a base interface/abstract class for all AI models
- Implement factory pattern for model instantiation

### 2. Support Multiple Providers
- **Current**: OpenAI (implemented)
- **Next**: Anthropic (to be implemented)
- **Future**: Perplexity (placeholder for easy addition)

### 3. Maintain Current Functionality
- Preserve existing interfaces (`AIProvider`, `ProviderScoringResult`)
- Keep integration with `PromptEngine`, `AnalyticalEngine`, and `RankingEngine`
- Maintain usage tracking and authentication flow

## Implementation Plan

### Phase 1: Create Base Architecture
1. Create `BaseAIModel` abstract class with common interface
2. Define standard methods: `query()`, `isConfigured()`, `getName()`

### Phase 2: Extract Existing Logic
1. Create `OpenAIModel` class extending `BaseAIModel`
2. Move current `queryOpenAI()` logic to the new class

### Phase 3: Add Anthropic Support
1. Create `AnthropicModel` class extending `BaseAIModel`
2. Implement Anthropic Claude API integration
3. Add web search capabilities if available

### Phase 4: Create Factory Pattern
1. Create `ModelFactory` class to instantiate appropriate models
2. Add model registry for easy extension

### Phase 5: Create Service Layer
1. Create `AEOAnalysisService` class to encapsulate business logic
2. Extract authentication, validation, and analysis logic from route handler
3. Move provider processing and result aggregation to service

### Phase 6: Refactor Route Handler
1. Update route.ts to use service layer
2. Keep route handler focused on HTTP concerns only
3. Maintain backward compatibility

## Technical Requirements

### Model Interface
Each model class should implement:
- `query(businessDescription: string): Promise<string>`
- `isConfigured(): boolean`
- `getName(): string`
- `getRequiredEnvVars(): string[]`

### Service Layer
The `AEOAnalysisService` class should handle:
- `validateAuthAndUsage()`: Authentication and usage limit validation
- `validateRequest()`: Request parameter validation
- `incrementUserUsage()`: Usage tracking
- `analyzeProviders()`: Core analysis workflow
- `runAnalysis()`: Main orchestration method

### Configuration
- Environment variables for each provider
- Graceful handling of missing API keys
- Clear error messages for configuration issues

### Extensibility
- Easy to add new providers
- Minimal changes to route.ts for new models
- Consistent error handling across all models
- Separation of concerns between HTTP and business logic

## File Structure
```
src/
├── app/api/aeo-score/
│   └── route.ts (minimal HTTP handler)
├── services/
│   ├── AEOAnalysisService.ts (business logic)
│   └── index.ts
├── lib/ai-models/
│   ├── BaseAIModel.ts
│   ├── OpenAIModel.ts
│   ├── AnthropicModel.ts
│   ├── ModelFactory.ts
│   └── index.ts
└── engines/
    ├── PromptEngine.ts (existing)
    ├── AnalyticalEngine.ts (existing)
    └── RankingEngine.ts (existing)
```

## Environment Variables
- `OPENAI_API_KEY` (existing)
- `ANTHROPIC_API_KEY` (new)
- `PERPLEXITY_API_KEY` (future)

## Implementation Status
✅ **Completed:**
- Created modular AI model architecture with `BaseAIModel` abstract class
- Implemented `OpenAIModel` and `AnthropicModel` classes
- Created `ModelFactory` for model management and registry
- Built `AEOAnalysisService` to handle all business logic
- Refactored `route.ts` to be a minimal HTTP handler
- Maintained all existing functionality and interfaces
- Added support for Anthropic Claude API
- Set up structure for easy addition of Perplexity and other models

🔄 **Ready for:**
- Adding Perplexity model (when ready)
- Testing with Anthropic API key
- Adding more AI providers as needed

## Notes
- Keep existing logging patterns for debugging
- Maintain performance characteristics
- All existing functionality preserved
- Clean separation of concerns between HTTP, business logic, and AI models
- Easy to test individual components in isolation