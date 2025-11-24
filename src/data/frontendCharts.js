export const globalArchitectureFrontendChart = `
    graph TD
        %% Définition des styles (Light Mode Palette)
        classDef frontend fill:#E3F2FD,stroke:#2196F3,stroke-width:2px,color:#0D47A1;
        classDef bff fill:#F3E5F5,stroke:#9C27B0,stroke-width:2px,color:#4A148C;
        classDef backend fill:#FFEBEE,stroke:#F44336,stroke-width:2px,color:#B71C1C;
        classDef db fill:#E8F5E9,stroke:#4CAF50,stroke-width:2px,color:#1B5E20;
        classDef external fill:#FFF3E0,stroke:#FF9800,stroke-width:2px,color:#E65100;

        User((Utilisateur)) --> Client[Navigateur / React]:::frontend

        Client --> |1. Request| Middleware[Middleware.ts / Auth Check]:::bff
        Middleware --> |2. Authorized| NextServer[Server Components / SSR]:::bff
        Client --> |3. Data Fetch| NextAPI[API Routes / Proxy]:::bff
        NextAPI --> Prisma[Prisma ORM]:::bff

        NextAPI --> |4. Proxy Request| ReportAPI[Backend API URL]:::backend
        ReportAPI --> Processing[Python/Node Workers]:::backend

        Prisma --> |User/Project Metadata| Postgres[(PostgreSQL)]:::db
        ReportAPI --> |Vector/Files| S3[(AWS S3)]:::external

        %% Application des styles
        linkStyle default stroke:#9E9E9E,stroke-width:1px;
`;

export const projectCreationWorkflowChart = `
    sequenceDiagram
        participant C as Client (React)
        participant N as Next.js API (BFF)
        participant B as Backend (API URL)
        participant D as DB (PostgreSQL)

        C->>N: POST /api/report/projects/create
        Note over N: Vérification Session (NextAuth)

        N->>B: POST /projects (X-API-Key)
        activate B
        Note right of B: Création ressource externe
        B-->>N: 200 OK { externalId: "xyz" }
        deactivate B

        opt Si Backend OK
            N->>D: Prisma.project.create({ externalId: "xyz" })
            activate D
            D-->>N: Project Entity
            deactivate D
        end

        N-->>C: 200 OK (Projet complet)
`;

export const middlewareFlowChart = `
    flowchart TD
        Start([Incoming Request]) --> CheckPath{Route protégée ?}

        CheckPath -->|Non| Allow[Autoriser]
        CheckPath -->|Oui| CheckToken{Token JWT valide ?}

        CheckToken -->|Non| RedirectSignin[Redirect /auth/signin]
        CheckToken -->|Oui| CheckAdmin{Route /admin/* ?}

        CheckAdmin -->|Non| Allow
        CheckAdmin -->|Oui| CheckRole{Role = SUPERADMIN ?}

        CheckRole -->|Non| RedirectDashboard[Redirect /dashboard]
        CheckRole -->|Oui| Allow

        Allow --> End([Continue to Page])
        RedirectSignin --> End
        RedirectDashboard --> End
`;

export const erdFrontendChart = `
    erDiagram
        USER ||--o{ PROJECT : "Owner"
        USER ||--o{ REFERENTIEL : "Manager"

        PROJECT {
            string id PK "CUID interne"
            string externalId "Lien vers Backend Core"
            string userId FK
            enum status "DRAFT, PROGRESS"
        }

        REFERENTIEL {
            string id
            boolean isPublic
            string ownerId FK
        }

        USER {
            string id
            string email
            enum role "ADMIN, REGULAR"
        }
`;

export const dataFetchingFlowChart = `
    sequenceDiagram
        participant UI as React Component
        participant RQ as React Query
        participant API as Next.js API Route
        participant Auth as NextAuth
        participant BE as Backend Core

        UI->>RQ: useQuery('projects')
        RQ->>API: GET /api/report/projects

        API->>Auth: getServerSession()
        Auth-->>API: Session Data

        alt Session Invalid
            API-->>RQ: 401 Unauthorized
            RQ-->>UI: Error State
        else Session Valid
            API->>BE: GET /projects (X-API-Key + userId)
            BE-->>API: Projects Data
            API-->>RQ: 200 OK + Data
            RQ-->>UI: Success State + Cache
        end
`;

export const realtimeEditingFlowChart = `
    sequenceDiagram
        participant U1 as User 1 (Browser)
        participant U2 as User 2 (Browser)
        participant WS as Socket.io Server
        participant DB as PostgreSQL

        U1->>WS: Connect to Room (projectId)
        U2->>WS: Connect to Room (projectId)

        U1->>WS: emit('update', { field, value })

        WS->>U2: broadcast('update', { field, value })
        Note over U2: UI mise à jour en temps réel

        WS->>DB: Async Save (Debounced)
        DB-->>WS: Saved

        WS->>U1: emit('saved', { timestamp })
        WS->>U2: emit('saved', { timestamp })
`;
