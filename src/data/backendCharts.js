export const globalArchitectureChart = `
    flowchart TD
        Client["Frontend / Client"]

        subgraph Backend
            Controller[DocumentsController]
            Service[DocumentsService]
            Repo[DocumentsRepository]
            Queue["Project Queues (In-Memory)"]
        end

        subgraph Database
            Postgres[("PostgreSQL / Prisma")]
        end

        subgraph Storage
            S3["AWS S3"]
        end

        subgraph AI_Vector
            OpenAI["OpenAI API (Embeddings)"]
            Pinecone["Pinecone (Vector DB)"]
        end

        subgraph External_Automation
            N8N["N8N Webhooks"]
        end

        Client -->|POST confirmMultipleUploads| Controller
        Controller --> Service
        Service --> Repo
        Repo --> Postgres
        Service --> Queue

        Service -->|Upload/Download| S3
        Service -->|Generate Embeddings| OpenAI
        Service -->|Store Vectors| Pinecone
        Service -->|Trigger Workflows| N8N
`;

export const confirmUploadsPhase1Chart = `
    sequenceDiagram
        participant Client
        participant Service as DocumentsService
        participant Queue as ProjectQueue (Map)
        participant DB as Database

        Client->>Service: confirmMultipleUploads(dto)
        Service->>DB: Vérifier accès Projet

        alt Projet Invalide
            Service-->>Client: Error 404/403
        else Projet Valide
            Service->>Queue: Créer/Récupérer Queue pour ProjectID
            Service->>Queue: Ajouter les documents à la liste

            opt Si traitement pas déjà en cours
                Service->>Service: Trigger processProjectQueue() (Async)
            end

            Service-->>Client: 200 OK { status: 'OK', message: 'Added to queue' }
        end
`;

export const confirmUploadsPhase2Chart = `
    flowchart TD
        Start(("Début processProjectQueue")) --> CheckGlobal["Vérifier Concurrence Globale"]
        CheckGlobal -- Trop de tâches actives --> WaitGlobal[Attendre...] --> CheckGlobal
        CheckGlobal -- OK --> LockProject["Verrouiller Queue Projet"]

        LockProject --> LoopQueue{"Queue Vide ?"}

        LoopQueue -- Non --> TakeBatch["Prendre tous les docs de la queue"]
        TakeBatch --> ProcessDocs["Traitement Parallèle (Semaphore)"]

        subgraph DocumentProcessing ["Traitement d'un Document"]
            Step1["Download & Upload S3"]
            Step2["Conversion PDF (si nécessaire)"]
            Step3["Extraction Texte (OCR/Text)"]

            Step3 --> CheckAutoCAD{"Check Ratio Poids/Pages"}
            CheckAutoCAD -- "> 0.5 MB/page" --> Reject["Rejet (AutoCAD)"]
            CheckAutoCAD -- OK --> Step4["Correction Hiérarchie Markdown"]

            Step4 --> TaskN8N["Envoi N8N (Extraction)"]
            Step4 --> TaskIndex["Indexation Pinecone"]

            TaskN8N --> WaitN8N["Attendre Disponibilité N8N"]
            TaskIndex --> WaitN8N
        end

        ProcessDocs --> DocumentProcessing
        DocumentProcessing --> ReleaseSlot["Libérer Slot Semaphore"]
        ReleaseSlot --> LoopQueue

        LoopQueue -- Oui (Plus de docs) --> SendProjectN8N["Envoi Projet complet à N8N"]
        SendProjectN8N --> UnlockProject["Déverrouiller & Nettoyer Queue"]
        UnlockProject --> End((Fin))
`;

export const documentLifecycleChart = `
    stateDiagram-v2
        [*] --> DRAFT: Création en base
        DRAFT --> PENDING: Upload S3 terminé
        PENDING --> NORMALIZING: Début extraction texte
        NORMALIZING --> PROGRESS: Début Chunking/Embedding

        state "Traitement Parallèle" as Parallel {
            state "Indexation Pinecone" as Index
            state "Extraction N8N" as N8N
        }

        PROGRESS --> Parallel
        Parallel --> COMPLETED: Tout terminé avec succès

        NORMALIZING --> ERROR: Échec extraction / Ratio AutoCAD
        PROGRESS --> ERROR: Document corrompu / Erreur API

        COMPLETED --> [*]
        ERROR --> [*]
`;

export const deploymentDiagram = `
    graph TD
        Client[Frontend React] -->|HTTPS| Backend[NestJS Backend]

        subgraph BackendInfrastructure[Backend Infrastructure]
            Backend -->|API Layer| Controllers
            Backend -->|Business Logic| Services
            Backend -->|Data Access| Repositories
        end

        Backend -->|Persistance| DB[(PostgreSQL + pgvector)]
        Backend -->|Storage| S3[AWS S3]
        Backend -->|Vector Search| Pinecone[Pinecone DB]
        Backend -->|AI Models| AI[OpenAI / Claude / Gemini]
        Backend -->|Automation| N8N[N8N Webhooks]
`;

export const dataFlowIndexationChart = `
    graph TD
        Client[Client Upload] --> Queue[Queue par Projet]
        Queue --> Download[Download HTTP]
        Download --> UploadS3[Upload S3]
        UploadS3 --> Extract[Extraction Texte]
        Extract --> Correction[Correction MD]
        Correction --> Chunking[Chunking]
        Chunking --> DB_Chunks[(PostgreSQL Chunks)]
        Chunking --> Embedding[Embedding]
        Embedding --> DB_Embed[(PostgreSQL Embeddings)]
        Embedding --> Pinecone[Pinecone Vector DB]

        Correction --> N8N_Doc[N8N Document]
        N8N_Doc --> AI_Meta[Extraction AI Metadata]

        Pinecone --> CheckAll{Tous docs traités?}
        AI_Meta --> CheckAll

        CheckAll -->|Oui| N8N_Proj[N8N Projet]
        N8N_Proj --> ExtractProj[Extraction Projet]
`;

export const workflowUploadIndexationChart = `
    flowchart TD
        Start([Client Upload URLs]) --> Validate[Valider Projet & Organisation]
        Validate --> CheckAccess{Accès autorisé ?}
        CheckAccess -->|Non| Error403[403 Forbidden]
        CheckAccess -->|Oui| CreateQueue[Créer/Récupérer Queue Projet]

        CreateQueue --> AddToQueue[Ajouter docs à la queue]
        AddToQueue --> CheckProcessing{Queue en cours ?}
        CheckProcessing -->|Oui| ReturnOK[200 OK - Ajouté à queue]
        CheckProcessing -->|Non| TriggerProcess[Déclencher processProjectQueue]

        TriggerProcess --> WaitGlobalSlot[Attendre slot global]
        WaitGlobalSlot --> CheckGlobal{activeIndexations < MAX ?}
        CheckGlobal -->|Non| WaitGlobalSlot
        CheckGlobal -->|Oui| IncrementGlobal[Increment Global]

        IncrementGlobal --> CreateSemaphore[Créer Semaphore projet]
        CreateSemaphore --> LoopDocs{Documents dans queue ?}

        LoopDocs -->|Non| SendProjectN8N[Envoyer projet complet N8N]
        LoopDocs -->|Oui| TakeDocs[Prendre tous docs de queue]

        TakeDocs --> ParallelProcess[Traiter en parallèle avec Semaphore]

        subgraph ProcessDoc[Traitement d'un Document]
            AcquireSem[Acquérir slot Semaphore] --> CreateDocDB[Créer Document en DB]
            CreateDocDB --> UpdateStatus1[Status = DRAFT]
            UpdateStatus1 --> DownloadHTTP[Download HTTP depuis URL]
            DownloadHTTP --> CheckDownload{Download OK ?}
            CheckDownload -->|Non| ErrorDownload[Status = ERROR]
            CheckDownload -->|Oui| CheckFileType{Type de fichier ?}

            CheckFileType -->|DOCX/DOC/RTF| ConvertPDF[Convertir en PDF]
            CheckFileType -->|PDF/TXT| SkipConvert[Pas de conversion]
            ConvertPDF --> UploadS3
            SkipConvert --> UploadS3[Upload vers S3]

            UploadS3 --> UpdateStatus2[Status = PENDING]
            UpdateStatus2 --> DownloadS3[Download S3 vers /tmp]
            DownloadS3 --> UpdateStatus3[Status = NORMALIZING]
            UpdateStatus3 --> ExtractText[Extraction Texte]

            ExtractText --> CheckExtractType{Type extraction ?}
            CheckExtractType -->|PDF| UsePDFLib[pdf-lib extraction]
            CheckExtractType -->|Image-heavy| UseMistralOCR[Mistral OCR]
            CheckExtractType -->|DOCX| UseDocxExtract[docx parser]

            UsePDFLib --> CheckExtract{Extraction OK ?}
            UseMistralOCR --> CheckExtract
            UseDocxExtract --> CheckExtract
            CheckExtract -->|Non| ErrorExtract[Status = ERROR]

            CheckExtract -->|Oui| ExtractMetadata[Extraire métadonnées PDF]
            ExtractMetadata --> CheckRatio{Ratio poids/pages ?}
            CheckRatio -->|> 0.5 MB/page| RejectAutoCAD[Status = ERROR - AutoCAD]
            CheckRatio -->|OK| FixMarkdown[Corriger hiérarchie Markdown]

            FixMarkdown --> SaveContent[Sauver content en DB]
            SaveContent --> UpdateStatus4[Status = PROGRESS]
            UpdateStatus4 --> ChunkText[Chunking texte]

            ChunkText --> CheckCorruption{Chunks corrompus ?}
            CheckCorruption -->|> 50%| ErrorCorrupt[Status = ERROR]
            CheckCorruption -->|OK| ParallelTasks[Tâches parallèles]

            subgraph ParallelTasks[Traitement Parallèle]
                Task1[Indexation Pinecone]
                Task2[Envoi N8N Document]
            end

            Task1 --> CreateChunksDB[Créer Chunks en DB]
            CreateChunksDB --> BatchEmbedding[Générer Embeddings par batch]
            BatchEmbedding --> RetryEmbedding{Erreur ?}
            RetryEmbedding -->|Oui + Retriable| WaitRetry[Wait backoff]
            WaitRetry --> BatchEmbedding
            RetryEmbedding -->|Non| SaveEmbeddings[Sauver Embeddings DB]
            SaveEmbeddings --> UpsertPinecone[Upsert vecteurs Pinecone]
            UpsertPinecone --> UpdateIndexStatus[indexation_status = COMPLETED]

            Task2 --> PreparePayload[Préparer payload N8N]
            PreparePayload --> SendN8NDoc[POST /index-process]
            SendN8NDoc --> CheckN8NDoc{N8N OK ?}
            CheckN8NDoc -->|Non| WarnN8N[Log warning]
            CheckN8NDoc -->|Oui| WaitN8NSlot[Attendre N8N disponible]

            WaitN8NSlot --> CheckN8NRunning{running < MAX ?}
            CheckN8NRunning -->|Non| SleepN8N[Sleep 5s]
            SleepN8N --> WaitN8NSlot
            CheckN8NRunning -->|Oui| ReleaseSlot[Libérer Semaphore slot]

            UpdateIndexStatus --> ReleaseSlot
            WarnN8N --> ReleaseSlot
        end

        ParallelProcess --> ProcessDoc
        ProcessDoc --> LoopDocs

        SendProjectN8N --> CheckProjectName{Projet a nom ?}
        CheckProjectName -->|Oui| SkipProjectN8N[Skip envoi N8N]
        CheckProjectName -->|Non| SendN8NProj[POST /documate]
        SendN8NProj --> UnlockQueue[Déverrouiller queue]
        SkipProjectN8N --> UnlockQueue

        UnlockQueue --> DecrementGlobal[Decrement Global]
        DecrementGlobal --> End([Fin])

        ReturnOK --> End
        Error403 --> End
        ErrorDownload --> ReleaseSlot
        ErrorExtract --> ReleaseSlot
        RejectAutoCAD --> ReleaseSlot
        ErrorCorrupt --> ReleaseSlot
`;

export const workflowDeliverableChart = `
    flowchart TD
        Start([Client POST /deliverables]) --> Validate[Valider Projet & Docs]
        Validate --> CheckAccess{Accès autorisé ?}
        CheckAccess -->|Non| Error403[403 Forbidden]
        CheckAccess -->|Oui| CheckExisting{Livrable existe ?}

        CheckExisting -->|Oui & new=false| ReturnExisting[Retourner existant]
        CheckExisting -->|Non ou new=true| CreateDB[Créer Deliverable en DB]

        CreateDB --> UpdateStatus1[Status = DRAFT]
        UpdateStatus1 --> EmitEvent[Émettre event 'deliverable.process']
        EmitEvent --> ReturnCreated[200 OK - Créé]

        ReturnCreated --> QueueTask[Ajouter à DeliverableQueue]
        QueueTask --> WaitSlot[Attendre slot queue]
        WaitSlot --> CheckSlot{Slot disponible ?}
        CheckSlot -->|Non| WaitSlot
        CheckSlot -->|Oui| AcquireSlot[Acquérir slot]

        AcquireSlot --> UpdateStatus2[Status = PROGRESS]
        UpdateStatus2 --> GetStrategy[Charger Stratégie]
        GetStrategy --> LoadRules{Type nécessite règles ?}

        LoadRules -->|AUTO_CONTROLE| LoadRulebook[Charger Rulebook]
        LoadRules -->|Autre| SkipRules[Pas de règles]
        LoadRulebook --> SkipRules

        SkipRules --> LoadContext[Préparer contexte]
        LoadContext --> GetDocuments[Récupérer documents + chunks]
        GetDocuments --> InitLLM[Initialiser client LLM]

        InitLLM --> CheckProvider{Provider ?}
        CheckProvider -->|OpenAI| InitOpenAI[OpenAI client]
        CheckProvider -->|Anthropic| InitAnthropic[Anthropic client]
        CheckProvider -->|Gemini| InitGemini[Gemini client]

        InitOpenAI --> PrepareTools[Préparer AI Tools]
        InitAnthropic --> PrepareTools
        InitGemini --> PrepareTools

        PrepareTools --> DefineTools{Quels tools ?}
        DefineTools --> SearchTool[searchInDocuments]
        DefineTools --> ReadTool[readDocument]
        DefineTools --> WebTool[webSearch - si besoin]

        SearchTool --> StartGeneration[Démarrer génération]
        ReadTool --> StartGeneration
        WebTool --> StartGeneration

        StartGeneration --> StreamResponse[Stream LLM response]
        StreamResponse --> CheckToolCall{Tool call ?}

        CheckToolCall -->|searchInDocuments| ExecuteSearch[Recherche vectorielle]
        CheckToolCall -->|readDocument| ExecuteRead[Lire document]
        CheckToolCall -->|webSearch| ExecuteWeb[Recherche web Exa]
        CheckToolCall -->|Non| ContinueStream[Continuer stream]

        ExecuteSearch --> VectorSearch[Générer embedding query]
        VectorSearch --> PineconeQuery[Query Pinecone]
        PineconeQuery --> GetChunks[Récupérer chunks DB]
        GetChunks --> ReturnResults[Retourner résultats]
        ReturnResults --> StreamResponse

        ExecuteRead --> FindDoc[Trouver document]
        FindDoc --> GetContent[Récupérer content]
        GetContent --> ReturnContent[Retourner texte]
        ReturnContent --> StreamResponse

        ExecuteWeb --> ExaSearch[API Exa.ai]
        ExaSearch --> ParseResults[Parser résultats]
        ParseResults --> ReturnWeb[Retourner résultats]
        ReturnWeb --> StreamResponse

        ContinueStream --> CheckComplete{Génération terminée ?}
        CheckComplete -->|Non| StreamResponse
        CheckComplete -->|Oui| SaveResults[Sauver long_result]

        SaveResults --> GenerateSummary[Générer short_result]
        GenerateSummary --> UpdateStatus3[Status = COMPLETED]
        UpdateStatus3 --> NotifyWebhook{Webhook défini ?}

        NotifyWebhook -->|Oui| SendWebhook[POST webhook]
        NotifyWebhook -->|Non| SkipWebhook[Skip]
        SendWebhook --> ReleaseSlot[Libérer slot queue]
        SkipWebhook --> ReleaseSlot

        ReleaseSlot --> End([Fin])

        Error403 --> End
        ReturnExisting --> End
        ReturnCreated --> End
`;

export const workflowChatChart = `
    flowchart TD
        Start([User Message]) --> ValidateChat[Valider Chat & Org]
        ValidateChat --> CheckAccess{Accès autorisé ?}
        CheckAccess -->|Non| Error403[403 Forbidden]
        CheckAccess -->|Oui| SaveMessage[Sauver message utilisateur]

        SaveMessage --> GetHistory[Récupérer historique]
        GetHistory --> BuildMessages[Construire tableau messages]
        BuildMessages --> InitLLM[Initialiser LLM client]

        InitLLM --> CheckProvider{Provider ?}
        CheckProvider -->|OpenAI| OpenAIStream[streamText OpenAI]
        CheckProvider -->|Anthropic| AnthropicStream[streamText Anthropic]
        CheckProvider -->|Gemini| GeminiStream[streamText Gemini]

        OpenAIStream --> DefineTools[Définir AI Tools]
        AnthropicStream --> DefineTools
        GeminiStream --> DefineTools

        DefineTools --> ToolDef1[retrieveContext]
        DefineTools --> ToolDef2[getDocumentsList]
        DefineTools --> ToolDef3[webSearch]

        ToolDef1 --> StartStream[Démarrer stream]
        ToolDef2 --> StartStream
        ToolDef3 --> StartStream

        StartStream --> SSESetup[Setup SSE headers]
        SSESetup --> StreamLoop{Chunk reçu ?}

        StreamLoop -->|text-delta| SendText[Envoyer texte client]
        StreamLoop -->|tool-call| ExecuteTool[Exécuter tool]
        StreamLoop -->|tool-result| SendResult[Envoyer résultat]
        StreamLoop -->|finish| StreamFinish[Fin stream]

        ExecuteTool --> CheckTool{Quel tool ?}

        CheckTool -->|retrieveContext| RetrieveCtx[Recherche vectorielle]
        RetrieveCtx --> GenEmbedding[Générer embedding]
        GenEmbedding --> LogUsage1[Log usage embedding]
        LogUsage1 --> QueryPinecone1[Query Pinecone project]
        QueryPinecone1 --> QueryPinecone2[Query Pinecone reference]
        QueryPinecone2 --> MergeResults[Fusionner résultats]
        MergeResults --> GetChunks1[Récupérer chunks]
        GetChunks1 --> FormatContext[Formater contexte]
        FormatContext --> StreamLoop

        CheckTool -->|getDocumentsList| GetDocs[Lister documents projet]
        GetDocs --> FormatList[Formater liste]
        FormatList --> StreamLoop

        CheckTool -->|webSearch| WebSearch[Recherche Exa.ai]
        WebSearch --> ParseWeb[Parser résultats]
        ParseWeb --> StreamLoop

        SendText --> StreamLoop
        SendResult --> StreamLoop

        StreamFinish --> SaveResponse[Sauver message assistant]
        SaveResponse --> LogUsageChat[Log usage LLM]
        LogUsageChat --> SendFinish[Envoyer event 'finish']
        SendFinish --> CloseSSE[Fermer connexion SSE]

        CloseSSE --> End([Fin])
        Error403 --> End
`;

export const workflowDeleteChart = `
    flowchart TD
        Start([DELETE /documents/:id]) --> Validate[Valider Projet & Org]
        Validate --> CheckAccess{Accès autorisé ?}
        CheckAccess -->|Non| Error403[403 Forbidden]
        CheckAccess -->|Oui| GetDocument[Récupérer Document + Chunks]

        GetDocument --> CheckExists{Document existe ?}
        CheckExists -->|Non| Error404[404 Not Found]
        CheckExists -->|Oui| CheckProject{Appartient au projet ?}
        CheckProject -->|Non| Error403B[403 Forbidden]
        CheckProject -->|Oui| GetChunkIds[Extraire IDs des chunks]

        GetChunkIds --> CheckChunks{A des chunks ?}
        CheckChunks -->|Oui| DeletePinecone[Supprimer vecteurs Pinecone]
        CheckChunks -->|Non| SkipPinecone[Skip Pinecone]

        DeletePinecone --> BatchDelete[Batch delete par 1000]
        BatchDelete --> LogPinecone[Log suppression]
        LogPinecone --> SkipPinecone

        SkipPinecone --> CheckS3{Document a path S3 ?}
        CheckS3 -->|Oui| DeleteS3[Supprimer fichier S3]
        CheckS3 -->|Non| SkipS3[Skip S3]

        DeleteS3 --> LogS3[Log suppression S3]
        LogS3 --> SkipS3

        SkipS3 --> DeleteDB[Supprimer Document DB]
        DeleteDB --> CascadeDelete[Cascade: Chunks + Embeddings]
        CascadeDelete --> ReturnSuccess[200 OK - Document supprimé]

        ReturnSuccess --> End([Fin])
        Error403 --> End
        Error403B --> End
        Error404 --> End
`;
