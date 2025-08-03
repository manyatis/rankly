# Background Processing Flow Diagrams

## Complete Job Processing Flow

```mermaid
graph TD
    A[User Creates Job] --> B[Job Stored in Database]
    B --> C{Job Status: not-started}
    
    C --> D[JobScheduler Scans Database<br/>Every 1 minute]
    D --> E[Find Jobs: status=not-started<br/>inProgress=false]
    E --> F[Atomic Lock Attempt<br/>UPDATE WHERE conditions]
    
    F --> G{Lock Successful?}
    G -->|Yes| H[Add to website-analysis Queue]
    G -->|No| I[Another processor got it<br/>Skip this job]
    
    H --> J[JobCoordinator Assigns<br/>Every 5 seconds]
    J --> K[Get Available Processor]
    K --> L[Assign Job to Processor]
    L --> M[Processor Starts Processing]
    
    M --> N[StagedAnalysisService.processNotStartedJobById]
    N --> O[Extract Website Info]
    O --> P[Update Job: status=prompt-forming<br/>inProgress=false]
    
    P --> Q[JobScheduler Finds Job<br/>status=prompt-forming]
    Q --> R[Atomic Lock & Queue<br/>prompt-forming]
    R --> S[Processor Generates Prompts]
    S --> T[Update Job: status=model-analysis<br/>inProgress=false]
    
    T --> U[JobScheduler Finds Job<br/>status=model-analysis]
    U --> V[Atomic Lock & Queue<br/>model-analysis]
    V --> W[Processor Runs AI Analysis]
    W --> X[Update Job: status=completed<br/>inProgress=false]
    
    X --> Y[Job Complete]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style H fill:#e8f5e8
    style R fill:#e8f5e8
    style V fill:#e8f5e8
    style Y fill:#c8e6c9
```

## Atomic Locking Mechanism

```mermaid
sequenceDiagram
    participant JS as JobScheduler
    participant DB as Database
    participant JQ as JobQueue
    participant P1 as Processor 1
    participant P2 as Processor 2

    Note over JS: Every 1 minute scan
    JS->>DB: SELECT jobs WHERE status='not-started' AND inProgress=false
    DB-->>JS: Returns: [job1, job2, job3]
    
    Note over JS: Try to lock job1
    JS->>DB: UPDATE job1 SET inProgress=true WHERE id=job1 AND inProgress=false
    DB-->>JS: Success: 1 row affected
    JS->>JQ: Queue job1 in website-analysis
    
    Note over JS: Try to lock job2 (simultaneously with another scheduler)
    par Scheduler 1
        JS->>DB: UPDATE job2 SET inProgress=true WHERE id=job2 AND inProgress=false
    and Scheduler 2 (different instance)
        JS->>DB: UPDATE job2 SET inProgress=true WHERE id=job2 AND inProgress=false
    end
    
    DB-->>JS: Success: 1 row affected (only one succeeds)
    Note over JS: Other scheduler gets 0 rows affected
    JS->>JQ: Queue job2 in website-analysis (only winner queues it)
    
    Note over JQ: JobCoordinator assigns jobs
    JQ->>P1: Assign job1
    JQ->>P2: Assign job2
    
    P1->>P1: Process job1
    P2->>P2: Process job2
```

## Race Condition Prevention

```mermaid
graph LR
    subgraph "❌ WITHOUT Atomic Locking"
        A1[Scheduler 1<br/>Finds Job X] --> B1[Scheduler 1<br/>Queues Job X]
        A2[Scheduler 2<br/>Finds Job X] --> B2[Scheduler 2<br/>Queues Job X]
        B1 --> C1[Processor 1<br/>Processes Job X]
        B2 --> C2[Processor 2<br/>Processes Job X]
        C1 --> D[❌ DUPLICATE PROCESSING]
        C2 --> D
    end
    
    subgraph "✅ WITH Atomic Locking"
        E1[Scheduler 1<br/>Tries to Lock Job X] --> F{Database<br/>Atomic UPDATE}
        E2[Scheduler 2<br/>Tries to Lock Job X] --> F
        F -->|Winner| G1[Scheduler 1<br/>Successfully Locks]
        F -->|Loser| G2[Scheduler 2<br/>Lock Fails]
        G1 --> H1[Queue Job X]
        G2 --> H2[Skip Job X]
        H1 --> I[✅ SINGLE PROCESSING]
    end
    
    style D fill:#ffebee,color:#c62828
    style I fill:#e8f5e8,color:#2e7d32
```

## Queue Safety Mechanisms

```mermaid
graph TD
    A[Job Arrives at Queue] --> B{Already in<br/>Same Phase Queue?}
    B -->|Yes| C[❌ Reject: Already Queued]
    B -->|No| D{Already Being<br/>Processed?}
    
    D -->|Yes| E[❌ Reject: Currently Processing]
    D -->|No| F{In Other<br/>Phase Queue?}
    
    F -->|Yes| G[❌ Reject: Wrong Phase]
    F -->|No| H{Queue Full?<br/>(Max 1000)}
    
    H -->|Yes| I[❌ Reject: Queue Full]
    H -->|No| J[✅ Accept: Add to Queue]
    
    style C fill:#ffebee
    style E fill:#ffebee
    style G fill:#ffebee
    style I fill:#ffebee
    style J fill:#e8f5e8
```

## Processor Pool Architecture

```mermaid
graph TB
    subgraph "ProcessorPool"
        subgraph "Website Analysis Pool"
            WA1[Processor 1<br/>Status: idle]
            WA2[Processor 2<br/>Status: busy]
            WA3[Processor 3<br/>Status: idle]
            WA_ETC[... 7 more<br/>Total: 10]
        end
        
        subgraph "Prompt Forming Pool"
            PF1[Processor 1<br/>Status: idle]
            PF2[Processor 2<br/>Status: idle]
            PF3[Processor 3<br/>Status: error]
            PF_ETC[... 7 more<br/>Total: 10]
        end
        
        subgraph "Model Analysis Pool"
            MA1[Processor 1<br/>Status: busy]
            MA2[Processor 2<br/>Status: busy]
            MA3[Processor 3<br/>Status: idle]
            MA_ETC[... 7 more<br/>Total: 10]
        end
    end
    
    subgraph "Job Queues"
        WQ[Website Analysis<br/>Queue: 0 jobs]
        PQ[Prompt Forming<br/>Queue: 2 jobs]
        MQ[Model Analysis<br/>Queue: 5 jobs]
    end
    
    subgraph "JobCoordinator"
        JC[Assignment Logic<br/>Every 5 seconds<br/>Max 3 per cycle]
    end
    
    WQ --> JC
    PQ --> JC
    MQ --> JC
    
    JC --> WA1
    JC --> PF1
    JC --> MA3
    
    style WA2 fill:#ffb74d
    style MA1 fill:#ffb74d
    style MA2 fill:#ffb74d
    style PF3 fill:#f44336,color:white
```

## Health Check and Recovery

```mermaid
graph TD
    A[Health Check<br/>Every 30 seconds] --> B{Check Stuck<br/>Processors}
    B --> C{Processor Busy<br/>> 5 minutes?}
    C -->|Yes| D[Mark as Error<br/>Release Job]
    C -->|No| E[Processor OK]
    
    D --> F[Return Job to Queue<br/>Increment Retry Count]
    E --> G{Check Stuck<br/>Database Jobs}
    F --> G
    
    G --> H{Job inProgress<br/>> 5 minutes?}
    H -->|Yes| I[Release Job<br/>Set inProgress=false]
    H -->|No| J[Job OK]
    
    I --> K[Job Available for<br/>Next Scan Cycle]
    J --> L[Health Check Complete]
    K --> L
    
    style D fill:#ff9800
    style I fill:#ff9800
    style L fill:#4caf50
```

## System Timing and Coordination

```mermaid
gantt
    title Background Processing Timeline
    dateFormat X
    axisFormat %Ss

    section JobScheduler
    Scan Database       :0, 60
    Scan Database       :60, 120
    Scan Database       :120, 180

    section JobCoordinator  
    Assign Jobs         :0, 5
    Assign Jobs         :5, 10
    Assign Jobs         :10, 15
    Assign Jobs         :15, 20
    Assign Jobs         :20, 25

    section Health Checks
    Health Check        :0, 30
    Health Check        :30, 60
    Health Check        :60, 90

    section Stuck Job Cleanup
    Cleanup Cycle       :0, 300
    Cleanup Cycle       :300, 600
```

## Error Handling and Retry Logic

```mermaid
graph TD
    A[Job Processing Starts] --> B{Processing<br/>Successful?}
    B -->|Yes| C[Mark Job Complete<br/>Release Processor]
    B -->|No| D{Retry Count<br/>< 3?}
    
    D -->|Yes| E[Increment Retry Count<br/>Release Job Lock]
    D -->|No| F[Mark Job Failed<br/>Stop Retrying]
    
    E --> G[Job Returns to<br/>Available Pool]
    G --> H[Next Scan Cycle<br/>Will Pick It Up]
    
    F --> I[Job Marked as<br/>Permanently Failed]
    C --> J[Job Complete]
    
    style C fill:#4caf50
    style F fill:#f44336,color:white
    style J fill:#4caf50
    style I fill:#f44336,color:white
```

## Performance Monitoring

```mermaid
graph LR
    subgraph "Metrics Collected"
        A[Queue Sizes<br/>Per Phase]
        B[Processor Status<br/>idle/busy/error]
        C[Job Processing Time<br/>Per Phase]
        D[Success/Failure Rates<br/>Per Phase]
        E[Retry Counts<br/>Per Job]
    end
    
    subgraph "Monitoring Output"
        F[Console Logs<br/>Real-time]
        G[Queue Stats<br/>Every Scan]
        H[Health Status<br/>Every 30s]
        I[Performance Metrics<br/>Per Job]
    end
    
    A --> F
    B --> G
    C --> H
    D --> I
    E --> F
    
    style F fill:#e3f2fd
    style G fill:#e3f2fd
    style H fill:#e3f2fd
    style I fill:#e3f2fd
```

## Key Success Factors

### 1. **Atomic Database Operations**
- All job locking uses `UPDATE ... WHERE` with multiple conditions
- Only successful updates result in job queueing
- Database handles concurrency at the lowest level

### 2. **Multiple Safety Layers**
- Database-level locking (primary)
- Queue-level duplicate detection (secondary)
- Cross-queue validation (tertiary)

### 3. **Controlled Resource Usage**
- Limited batch sizes (10 jobs per scan)
- Throttled assignments (3 per cycle)
- Reasonable timing intervals

### 4. **Comprehensive Recovery**
- Stuck job detection and release
- Processor health monitoring
- Automatic retry with limits

### 5. **Observable System**
- Detailed logging at every step
- Real-time status monitoring
- Performance metrics collection

This architecture ensures that each website is processed by exactly one processor at any given time, preventing the duplicate processing issues you observed.