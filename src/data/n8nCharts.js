export const n8nArchitectureChart = `
    graph TD
        %% Styles
        classDef proxy fill:#E3F2FD,stroke:#2196F3,stroke-width:2px,color:#0D47A1;
        classDef main fill:#F3E5F5,stroke:#9C27B0,stroke-width:2px,color:#4A148C;
        classDef worker fill:#E8F5E9,stroke:#4CAF50,stroke-width:2px,color:#1B5E20;
        classDef storage fill:#FFF3E0,stroke:#FF9800,stroke-width:2px,color:#E65100;
        classDef external fill:#FFEBEE,stroke:#F44336,stroke-width:2px,color:#B71C1C;

        Internet((Internet)) --> Traefik[Traefik Reverse Proxy<br/>Port 80/443]:::proxy

        subgraph N8NInfrastructure[N8N Infrastructure]
            Traefik --> Main[N8N Main Instance<br/>Port 5678<br/>Concurrency: 0]:::main

            Main --> Redis[(Redis Queue<br/>Bull MQ)]:::storage

            Redis --> Worker[N8N Worker<br/>Concurrency: 5]:::worker

            Main --> DB[(PostgreSQL RDS<br/>eu-north-1<br/>Pool: 15)]:::storage
            Worker --> DB
        end

        subgraph ExternalServices[External Services]
            Worker --> Backend[Backend API<br/>NestJS]:::external
            Worker --> OpenAI[OpenAI API]:::external
            Worker --> Mistral[Mistral OCR]:::external
        end

        linkStyle default stroke:#9E9E9E,stroke-width:1px;
`;

export const n8nExecutionFlowChart = `
    sequenceDiagram
        participant Client as Client/Webhook
        participant Traefik as Traefik
        participant Main as N8N Main
        participant Redis as Redis Queue
        participant Worker as N8N Worker
        participant DB as PostgreSQL

        Client->>Traefik: POST /webhook/xyz
        Traefik->>Main: Forward Request

        Main->>DB: Save Execution (PENDING)
        Main->>Redis: Enqueue Job
        Main-->>Client: 200 OK (Queued)

        Note over Redis,Worker: Async Processing

        Worker->>Redis: Poll Job
        Redis-->>Worker: Job Data

        Worker->>DB: Update Status (RUNNING)
        Worker->>Worker: Execute Workflow

        alt Success
            Worker->>DB: Update Status (SUCCESS)
            Worker->>DB: Save Results
        else Error
            Worker->>DB: Update Status (ERROR)
            Worker->>DB: Save Error Details
        end
`;

export const n8nScalingChart = `
    flowchart TD
        Start([Webhook Trigger]) --> Main[N8N Main<br/>Concurrency: 0]

        Main --> Queue[Redis Bull Queue]

        Queue --> Worker1[Worker 1<br/>Concurrency: 5]
        Queue --> Worker2[Worker 2<br/>Concurrency: 5]
        Queue --> WorkerN[Worker N<br/>Concurrency: 5]

        Worker1 --> Process1[Process 5 jobs<br/>simultaneously]
        Worker2 --> Process2[Process 5 jobs<br/>simultaneously]
        WorkerN --> ProcessN[Process 5 jobs<br/>simultaneously]

        Process1 --> DB[(PostgreSQL)]
        Process2 --> DB
        ProcessN --> DB

        style Queue fill:#FFE082
        style Main fill:#CE93D8
        style Worker1 fill:#A5D6A7
        style Worker2 fill:#A5D6A7
        style WorkerN fill:#A5D6A7
`;

export const n8nDeploymentChart = `
    graph TB
        subgraph UbuntuServer[Ubuntu Server ynor-n8n]
            Docker[Docker Engine]

            subgraph DockerComposeStack[Docker Compose Stack]
                Traefik[Traefik Container<br/>Ports: 80, 443]
                Redis[Redis Container<br/>Port: 6379]
                Main[N8N Main Container<br/>Image: n8nio/n8n:1.94.0]
                Worker[N8N Worker Container<br/>Image: n8nio/n8n:1.94.0]
            end

            Docker --> Traefik
            Docker --> Redis
            Docker --> Main
            Docker --> Worker
        end

        subgraph AWSCloud[AWS Cloud]
            RDS[(PostgreSQL RDS<br/>eu-north-1<br/>core-db-instance)]
        end

        Main --> RDS
        Worker --> RDS

        Internet((Internet<br/>HTTPS)) --> Traefik

        Traefik --> Main
        Main --> Redis
        Redis --> Worker

        style Traefik fill:#E3F2FD
        style Main fill:#F3E5F5
        style Worker fill:#E8F5E9
        style Redis fill:#FFF3E0
        style RDS fill:#FFEBEE
`;

export const n8nDomainRoutingChart = `
    flowchart LR
        Client1[Client:<br/>n8n.analyztech.com] --> Traefik
        Client2[Client:<br/>n8n.ynor.tech] --> Traefik

        Traefik{Traefik Router}

        Traefik -->|Host: n8n.analyztech.com| HTTPS1[HTTPS Route<br/>Port 443]
        Traefik -->|Host: n8n.ynor.tech| Redirect[Redirect Middleware<br/>301 Permanent]

        Redirect --> HTTPS1
        HTTPS1 --> N8N[N8N Main Instance<br/>Port 5678]

        style Traefik fill:#E3F2FD
        style Redirect fill:#FFE082
        style HTTPS1 fill:#C8E6C9
        style N8N fill:#F3E5F5
`;
