# Background Processing Architecture

## System Overview

The new background processing system uses a pool-based architecture with atomic job locking to prevent race conditions and ensure each job is processed exactly once.

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BACKGROUND PROCESSING SYSTEM                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │   Job Scheduler │    │   Job Queues    │    │ Processor Pools │              │
│  │   (Discovery)   │───▶│  (In-Memory)    │───▶│   (10 per phase)│              │
│  │   Every 1 min   │    │                 │    │                 │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
│           │                       │                       │                     │
│           ▼                       ▼                       ▼                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │    Database     │    │ Job Coordinator │    │ Background Jobs │              │
│  │ (Atomic Locking)│    │  (Assignment)   │    │   (Processing)  │              │
│  │                 │    │   Every 5 sec   │    │                 │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Job Lifecycle Flow

```
┌─────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│    User     │──▶│  API Route   │──▶│   Database   │──▶│ Job Created  │
│   Action    │   │   Creates    │   │    Stores    │   │ (not-started)│
└─────────────┘   │     Job      │   │     Job      │   └──────────────┘
                  └──────────────┘   └──────────────┘            │
                                                                 ▼
┌─────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Job Queued  │◀──│ Job Locked   │◀──│ Job Scanned  │◀──│ Job Scheduler│
│ (In-Memory) │   │ (Atomic DB)  │   │ (Database)   │   │ (Discovery)  │
└─────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
        │
        ▼
┌─────────────┐   ┌──────────────┐   ┌──────────────┐
│ Processor   │──▶│ Job Running  │──▶│ Job Complete │
│ Assigned    │   │ (Background) │   │ (Database)   │
└─────────────┘   └──────────────┘   └──────────────┘
```

### 2. Processing Phases

```
Phase 1: Website Analysis
┌─────────────────┐
│   not-started   │ ──┐
│   (Database)    │   │
└─────────────────┘   │
                      │  ┌─────────────────┐    ┌─────────────────┐
                      └─▶│ website-analysis│───▶│ prompt-forming  │
                         │    (Queue)      │    │   (Database)    │
                         └─────────────────┘    └─────────────────┘

Phase 2: Prompt Generation
┌─────────────────┐
│ prompt-forming  │ ──┐
│   (Database)    │   │
└─────────────────┘   │
                      │  ┌─────────────────┐    ┌─────────────────┐
                      └─▶│ prompt-forming  │───▶│ model-analysis  │
                         │    (Queue)      │    │   (Database)    │
                         └─────────────────┘    └─────────────────┘

Phase 3: AI Analysis
┌─────────────────┐
│ model-analysis  │ ──┐
│   (Database)    │   │
└─────────────────┘   │
                      │  ┌─────────────────┐    ┌─────────────────┐
                      └─▶│ model-analysis  │───▶│   completed     │
                         │    (Queue)      │    │   (Database)    │
                         └─────────────────┘    └─────────────────┘
```

## Anti-Duplication Mechanisms

### 1. Atomic Job Locking (JobScheduler)

```sql
-- JobScheduler.findJobsForPhase() - Atomic Locking Process

Step 1: Find Available Jobs
SELECT id, createdAt, retryCount, extractedInfo 
FROM AnalysisJob 
WHERE status = 'not-started' 
  AND currentStep = 'not-started'
  AND inProgress = false
  AND retryCount < 3
  AND updatedAt < (NOW() - 30 seconds)
ORDER BY createdAt ASC
LIMIT 10;

Step 2: Atomic Lock (For Each Job)
UPDATE AnalysisJob 
SET inProgress = true, updatedAt = NOW()
WHERE id = ? 
  AND inProgress = false      -- ⭐ Critical: Only if still available
  AND status = 'not-started' -- ⭐ Critical: Status hasn't changed
  AND currentStep = 'not-started'; -- ⭐ Critical: Step hasn't changed

-- If UPDATE affects 0 rows → Job already locked by another process
-- If UPDATE affects 1 row → Successfully locked, add to queue
```

### 2. Queue Duplication Prevention (JobQueue)

```javascript
// JobQueue.enqueue() - Multiple Safety Checks

enqueue(job) {
  // Check 1: Job already in same phase queue?
  if (queue.find(q => q.jobId === job.jobId)) {
    return false; // Already queued
  }

  // Check 2: Job already being processed?
  if (processingJobs.has(job.jobId)) {
    return false; // Already processing
  }

  // Check 3: Job in other phase queues?
  for (otherQueue of allQueues) {
    if (otherQueue.find(q => q.jobId === job.jobId)) {
      return false; // Already in different phase
    }
  }

  // Safe to queue
  queue.push(job);
}
```

### 3. Processor Assignment Flow

```
Job Coordinator (Every 5 seconds)
│
├─ For each phase (website-analysis, prompt-forming, model-analysis):
│  │
│  ├─ Max 3 assignments per cycle (throttling)
│  │
│  └─ For each assignment attempt:
│     │
│     ├─ Get available processor
│     │  └─ If none available → Skip phase
│     │
│     ├─ Dequeue job from phase queue
│     │  └─ If no jobs → Skip phase
│     │
│     ├─ Assign job to processor
│     │  ├─ Mark processor as busy
│     │  └─ Mark job as processing
│     │
│     └─ Start background processing
│        └─ Processor runs StagedAnalysisService
```

## Detailed Component Breakdown

### 1. JobScheduler (Discovery Engine)

**Purpose**: Discovers new jobs from database and locks them atomically

```
┌─────────────────────────────────────────────────────────┐
│                    JobScheduler                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⏰ Timer: Every 1 minute                              │
│  📊 Batch Size: 10 jobs per phase                      │
│  🔒 Locking: Atomic database updates                   │
│                                                         │
│  Flow:                                                  │
│  1. Scan database for jobs (status = phase)            │
│  2. Filter: inProgress = false, retryCount < 3         │
│  3. For each job: Atomic lock (UPDATE with conditions) │
│  4. If lock successful → Add to JobQueue               │
│  5. If lock fails → Another process got it             │
│                                                         │
│  🧹 Cleanup: Every 5 minutes                           │
│  - Release stuck jobs (inProgress > 5 min)             │
│  - Increment retry count                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. JobQueue (In-Memory Storage)

**Purpose**: Thread-safe queues for each processing phase

```
┌─────────────────────────────────────────────────────────┐
│                      JobQueue                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📋 3 Queues:                                          │
│  ├─ website-analysis: QueuedJob[]                      │
│  ├─ prompt-forming: QueuedJob[]                        │
│  └─ model-analysis: QueuedJob[]                        │
│                                                         │
│  🔄 Processing Map:                                     │
│  └─ processorId → QueuedJob (currently processing)     │
│                                                         │
│  🛡️ Safety Checks (enqueue):                          │
│  1. Not already in same phase queue                    │
│  2. Not already being processed                        │
│  3. Not in any other phase queue                       │
│                                                         │
│  ⚡ Operations:                                         │
│  ├─ enqueue(job) → Add with safety checks              │
│  ├─ dequeue(phase, processorId) → Get next job         │
│  ├─ completeJob(processorId) → Mark done               │
│  └─ releaseJob(processorId) → Return to queue          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3. ProcessorPool (Worker Management)

**Purpose**: Manages 10 processors per phase for concurrent processing

```
┌─────────────────────────────────────────────────────────┐
│                   ProcessorPool                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🏊 Processor Pools (10 each):                         │
│  ├─ website-analysis-processor-1 to 10                 │
│  ├─ prompt-forming-processor-1 to 10                   │
│  └─ model-analysis-processor-1 to 10                   │
│                                                         │
│  📊 Processor States:                                   │
│  ├─ idle: Available for work                           │
│  ├─ busy: Currently processing job                     │
│  └─ error: Failed, needs reset                         │
│                                                         │
│  🔧 Management:                                         │
│  ├─ getAvailableProcessor(phase) → idle processor      │
│  ├─ assignJob(processor, job) → mark busy              │
│  ├─ releaseProcessor(processor) → mark idle            │
│  └─ healthCheck() → reset error processors             │
│                                                         │
│  ⚡ Processing Functions:                               │
│  ├─ website-analysis → StagedAnalysisService.processNotStartedJobById
│  ├─ prompt-forming → StagedAnalysisService.processPromptFormingJobById
│  └─ model-analysis → StagedAnalysisService.processModelAnalysisJobById
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4. JobCoordinator (Assignment Engine)

**Purpose**: Assigns jobs from queues to available processors

```
┌─────────────────────────────────────────────────────────┐
│                   JobCoordinator                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⏰ Timer: Every 5 seconds                             │
│  🎯 Throttling: Max 3 assignments per phase per cycle  │
│                                                         │
│  Flow (for each phase):                                 │
│  1. Check available processors                          │
│  2. Check jobs in queue                                 │
│  3. Assign up to 3 jobs (throttled)                    │
│  4. Start background processing                         │
│                                                         │
│  🏥 Health Checks: Every 30 seconds                    │
│  ├─ Reset stuck processors                             │
│  ├─ Release stuck jobs                                  │
│  └─ Report system health                                │
│                                                         │
│  📈 Priority Order:                                     │
│  1. website-analysis (highest)                         │
│  2. prompt-forming                                      │
│  3. model-analysis (lowest)                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Race Condition Prevention

### Database Level (PostgreSQL)

```sql
-- The key insight: Use conditional UPDATE for atomic locking

-- ❌ BAD: Race condition possible
SELECT id FROM jobs WHERE inProgress = false;
UPDATE jobs SET inProgress = true WHERE id = ?;

-- ✅ GOOD: Atomic operation
UPDATE jobs 
SET inProgress = true, updatedAt = NOW()
WHERE id = ? 
  AND inProgress = false  -- Only if still available
  AND status = ?          -- Only if status unchanged
  AND currentStep = ?;    -- Only if step unchanged

-- Result tells us if we got the lock:
-- rowCount = 0 → Another process got it
-- rowCount = 1 → We successfully locked it
```

### Application Level (TypeScript)

```typescript
// Multiple layers of protection

class JobScheduler {
  async findJobsForPhase(status: string): Promise<Job[]> {
    // 1. Find candidates
    const candidates = await prisma.job.findMany({
      where: { status, inProgress: false, retryCount: { lt: 3 } }
    });

    const lockedJobs = [];
    
    // 2. Try to lock each one atomically
    for (const job of candidates) {
      const result = await prisma.job.updateMany({
        where: {
          id: job.id,
          inProgress: false, // ⭐ Critical condition
          status,            // ⭐ Critical condition  
          currentStep: status // ⭐ Critical condition
        },
        data: { inProgress: true, updatedAt: new Date() }
      });

      // 3. Only queue if we successfully locked it
      if (result.count > 0) {
        lockedJobs.push(job);
      }
    }

    return lockedJobs;
  }
}
```

## System Startup Sequence

```
1. Next.js App Starts
   └─ instrumentation.ts calls initializeServer()

2. PoolBasedBackgroundTaskManager.start()
   ├─ Initialize ProcessorPool (30 processors total)
   ├─ Initialize JobQueue (3 queues)
   ├─ Start JobScheduler (discovery every 1 min)
   └─ Start JobCoordinator (assignment every 5 sec)

3. Steady State Operation:
   ┌─ JobScheduler scans & locks jobs from DB
   ├─ Jobs added to appropriate queues
   ├─ JobCoordinator assigns jobs to processors
   └─ Processors run StagedAnalysisService methods
```

## Performance Characteristics

### Throughput
- **Concurrent Jobs**: Up to 30 jobs simultaneously (10 per phase)
- **Job Discovery**: Every 60 seconds (not too aggressive)
- **Job Assignment**: Every 5 seconds (balanced)
- **Batch Size**: 10 jobs per discovery cycle

### Safety
- **Atomic Locking**: Database-level prevention of race conditions
- **Multiple Checks**: Queue-level duplication prevention
- **Timeout Handling**: 5-minute stuck job recovery
- **Retry Logic**: Max 3 retries with exponential backoff

### Monitoring
- **Real-time Logs**: All major operations logged
- **Health Checks**: Every 30 seconds
- **Queue Statistics**: Live monitoring of queue sizes
- **Processor Status**: Track busy/idle/error states

## Key Anti-Patterns Avoided

### ❌ What We DON'T Do
```typescript
// ❌ BAD: Check then update (race condition)
const job = await findJob();
await updateJob(job.id, { inProgress: true });

// ❌ BAD: No duplicate prevention
queue.push(job); // Could add same job multiple times

// ❌ BAD: Too aggressive polling
setInterval(processJobs, 100); // Every 100ms is too much
```

### ✅ What We DO
```typescript
// ✅ GOOD: Atomic check-and-update
const result = await prisma.job.updateMany({
  where: { id, inProgress: false },
  data: { inProgress: true }
});
if (result.count === 0) return; // Another process got it

// ✅ GOOD: Comprehensive duplicate prevention
if (isAlreadyQueued(job) || isBeingProcessed(job)) return;

// ✅ GOOD: Balanced timing
setInterval(discoverJobs, 60000);  // 1 minute discovery
setInterval(assignJobs, 5000);     // 5 second assignment
```

This architecture ensures that each job is processed exactly once, with no race conditions or duplicate processing, while maintaining high throughput through concurrent processing pools.