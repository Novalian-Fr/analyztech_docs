// Utility to convert tab content to Markdown format
import * as BackendCharts from '../data/backendCharts';
import * as FrontendCharts from '../data/frontendCharts';
import * as N8NCharts from '../data/n8nCharts';
import * as AWSCharts from '../data/awsCharts';

export const generateBackendMarkdown = () => {
  return `# Backend Architecture - AnalyzeTech

## Architecture Globale

L'application utilise **NestJS** comme framework backend avec une architecture en couches (Controller → Service → Repository → Database).

### Services Principaux

- **PostgreSQL + Prisma**: Base de données relationnelle avec extensions pgvector et ltree
- **AWS S3**: Stockage des fichiers uploadés
- **Pinecone**: Base de données vectorielle pour la recherche sémantique
- **OpenAI API**: Génération d'embeddings et modèles IA
- **N8N**: Automatisation et workflows externes
- **Mistral OCR**: Extraction de texte depuis images
- **Exa.ai**: Recherche web pour enrichissement

### Diagramme d'Architecture Globale

\`\`\`mermaid
${BackendCharts.globalArchitectureChart}
\`\`\`

## Schéma de Base de Données

### Extensions PostgreSQL
- **pgvector**: Stockage et recherche de vecteurs d'embeddings
- **ltree**: Gestion de hiérarchies (arborescence de documents)

### Modèles Principaux
- **User**: Utilisateurs et organisations
- **Project**: Projets avec documents associés
- **Document**: Documents uploadés avec métadonnées
- **Chunk**: Fragments de texte pour indexation
- **Embedding**: Vecteurs d'embeddings pour recherche sémantique
- **Deliverable**: Livrables générés (rapports, analyses)

## Architecture NestJS

### Pattern en Couches
\`\`\`
Controller → Service → Repository → Database
\`\`\`

### Exemple: DocumentsController
\`\`\`typescript
@Controller('documents')
export class DocumentsController {
  @Post('confirm-multiple-uploads')
  async confirmMultipleUploads(@Body() dto: ConfirmMultipleUploadsDto) {
    return this.documentsService.confirmMultipleUploads(dto);
  }
}
\`\`\`

### Diagramme de Déploiement

\`\`\`mermaid
${BackendCharts.deploymentDiagram}
\`\`\`

## Workflow confirmMultipleUploads

### Phase 1: Réception Synchrone

\`\`\`mermaid
${BackendCharts.confirmUploadsPhase1Chart}
\`\`\`

1. Client envoie POST /documents/confirm-multiple-uploads
2. Vérification des accès projet/organisation
3. Création/récupération de la queue projet
4. Ajout des documents à la queue
5. Réponse immédiate 200 OK au client

### Phase 2: Traitement Asynchrone

\`\`\`mermaid
${BackendCharts.confirmUploadsPhase2Chart}
\`\`\`

1. Vérification de la concurrence globale (semaphore)
2. Verrouillage de la queue projet
3. Traitement parallèle des documents avec semaphore (max 3 simultanés)
4. Pour chaque document:
   - Download HTTP → Upload S3
   - Conversion PDF si nécessaire
   - Extraction texte (OCR/Text)
   - Vérification ratio AutoCAD (> 0.5 MB/page = rejet)
   - Correction hiérarchie Markdown
   - Chunking et génération embeddings
   - Indexation Pinecone
   - Envoi N8N pour extraction métadonnées
5. Envoi projet complet à N8N
6. Déverrouillage et nettoyage queue

## Cycle de Vie du Document

\`\`\`mermaid
${BackendCharts.documentLifecycleChart}
\`\`\`

États possibles:
- **DRAFT**: Créé en base
- **PENDING**: Upload S3 terminé
- **NORMALIZING**: Extraction texte en cours
- **PROGRESS**: Chunking/Embedding en cours
- **COMPLETED**: Traitement terminé avec succès
- **ERROR**: Échec (extraction, ratio AutoCAD, corruption)

## Workflows Détaillés

### A. Upload & Indexation Complète

\`\`\`mermaid
${BackendCharts.workflowUploadIndexationChart}
\`\`\`

### B. Génération de Livrable (Strategy Pattern)

\`\`\`mermaid
${BackendCharts.workflowDeliverableChart}
\`\`\`

### C. Chat avec Streaming (AI SDK v5)

\`\`\`mermaid
${BackendCharts.workflowChatChart}
\`\`\`

### D. Suppression de Document

\`\`\`mermaid
${BackendCharts.workflowDeleteChart}
\`\`\`

## Flux de Données (Indexation)

\`\`\`mermaid
${BackendCharts.dataFlowIndexationChart}
\`\`\`

## Bottlenecks & Optimisations

### Critique (P0)
- **Concurrence Indexation**: Semaphore global (3 max) + semaphore projet (3 max)
- **Timeout N8N**: 30s par workflow
- **Pool Prisma**: 10 connexions max
- **Rate Limit OpenAI**: Backoff exponentiel avec retry

### Haute Priorité (P1)
- **Chunking Corrompu**: Détection > 50% chunks invalides
- **AutoCAD Detection**: Ratio > 0.5 MB/page = rejet automatique
- **Embedding Batch**: 100 chunks par batch pour optimisation

### Solutions
- Augmenter pool Prisma si nécessaire
- Monitoring N8N pour identifier workflows lents
- Cache embeddings pour documents similaires
- Compression chunks avant stockage

## Sécurité

### Authentication
- JWT tokens via NextAuth
- Vérification organisation/projet à chaque requête
- RBAC (Role-Based Access Control)

### Validation
- Class-validator sur tous les DTOs
- Sanitization des inputs
- Vérification MIME types fichiers

### Secrets Management
- Variables d'environnement (.env)
- Rotation des clés API
- Chiffrement des données sensibles

## Stack Technique Complète

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| Framework | NestJS | Architecture backend |
| Runtime | Node.js + TypeScript | Exécution et typage |
| Database | PostgreSQL + Prisma | Persistance relationnelle |
| Vector DB | Pinecone | Recherche sémantique |
| Embeddings | OpenAI text-embedding-3-small | Génération vecteurs |
| Storage | AWS S3 | Fichiers uploadés |
| LLM | OpenAI GPT-4 / Claude 3.5 / Gemini 1.5 Pro | Génération contenu |
| OCR | Mistral OCR | Extraction texte images |
| Automation | N8N | Workflows externes |
| Search | Exa.ai | Recherche web |
| Streaming | Vercel AI SDK v5 | Stream LLM responses |
`;
};

export const generateFrontendMarkdown = () => {
  return `# Frontend Architecture - AnalyzeTech

## Architecture Globale & Flux

Application **Next.js Fullstack** (App Router) intégrant l'interface utilisateur, la logique API et la base de données dans une structure monolithique modulaire.

### Blocs Majeurs

1. **Client (Browser)**: React avec Next.js App Router
2. **BFF (Backend for Frontend)**: Next.js API Routes + Middleware
3. **Backend Core**: API Report (Python/Node Workers)

### Diagramme d'Architecture Globale

\`\`\`mermaid
${FrontendCharts.globalArchitectureFrontendChart}
\`\`\`

### Flux de Données
\`\`\`
Utilisateur → Navigateur/React → Middleware.ts (Auth) → Server Components/SSR
                                → API Routes → Prisma ORM → PostgreSQL
                                → Backend API (Proxy) → Backend Core
\`\`\`

## Workflows Détaillés

### A. Création de Projet (Transaction Distribuée)

\`\`\`mermaid
${FrontendCharts.projectCreationWorkflowChart}
\`\`\`

1. Client: POST /api/report/projects/create
2. Next.js: Vérification session (NextAuth)
3. Next.js → Backend: POST /projects (X-API-Key)
4. Backend: Création ressource externe → 200 OK { externalId }
5. Next.js → DB: Prisma.project.create({ externalId })
6. Next.js → Client: 200 OK (Projet complet)

### B. Middleware & Sécurité

\`\`\`mermaid
${FrontendCharts.middlewareFlowChart}
\`\`\`

1. Incoming Request
2. Check route protégée ?
   - Non → Autoriser
   - Oui → Check token JWT valide ?
     - Non → Redirect /auth/signin
     - Oui → Check route /admin/* ?
       - Non → Autoriser
       - Oui → Check role = SUPERADMIN ?
         - Non → Redirect /dashboard
         - Oui → Autoriser

### C. Flux de Données (React Query)

\`\`\`mermaid
${FrontendCharts.dataFetchingFlowChart}
\`\`\`

1. React Component: useQuery('projects')
2. React Query → Next.js API: GET /api/report/projects
3. API → NextAuth: getServerSession()
4. Si session invalide: 401 Unauthorized
5. Si session valide:
   - API → Backend Core: GET /projects (X-API-Key + userId)
   - Backend → API: Projects Data
   - API → React Query: 200 OK + Data
   - React Query: Success State + Cache

### D. Édition Temps Réel (Socket.io)

\`\`\`mermaid
${FrontendCharts.realtimeEditingFlowChart}
\`\`\`

1. User 1 & User 2: Connect to Room (projectId)
2. User 1: emit('update', { field, value })
3. Socket.io → User 2: broadcast('update', { field, value })
4. User 2: UI mise à jour en temps réel
5. Socket.io → DB: Async Save (Debounced)
6. Socket.io → All Users: emit('saved', { timestamp })

## Points d'Attention & Bottlenecks

| Risque | Niveau | Description | Solution | Monitoring |
|--------|--------|-------------|----------|------------|
| Serverless Timeout | Élevé | Vercel limite 10s (Hobby) / 60s (Pro) | Déplacer traitements longs vers Backend Core | Logs Vercel |
| Double Hop Latency | Moyen | Next.js → Backend Core ajoute latence | Cache React Query + Optimistic Updates | APM traces |
| Data Consistency | Moyen | Transaction distribuée Next.js ↔ Backend | Idempotence + Retry logic | Error logs |
| Prisma Connection Pool | Moyen | Pool exhaustion en serverless | Connection pooling (PgBouncer) | DB metrics |

## Zones Sensibles (Code & Config)

### Environment Variables
\`\`\`env
REPORT_API_URL=https://api.backend.com
NEXT_PUBLIC_REPORT_API_KEY=xxx
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=xxx
\`\`\`

### RBAC (Role-Based Access Control)
- **SUPERADMIN**: Accès total (admin panel)
- **ADMIN**: Gestion organisation
- **REGULAR**: Accès projets personnels

## Modèle de Données (ERD)

\`\`\`mermaid
${FrontendCharts.erdFrontendChart}
\`\`\`

### Entités Principales
- **USER**: { id, email, role: ADMIN|REGULAR }
- **PROJECT**: { id, externalId, userId, status: DRAFT|PROGRESS }
- **REFERENTIEL**: { id, isPublic, ownerId }

### Relations
- USER ||--o{ PROJECT (Owner)
- USER ||--o{ REFERENTIEL (Manager)

## Stack & Responsabilités

### Technologies Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Next.js | 15 (App Router) | Framework fullstack |
| Shadcn/ui | Latest | Composants UI |
| Tailwind CSS | 3.x | Styling |
| React Query | 5.x | Data fetching & cache |
| NextAuth.js | 5.x | Authentication |
| Socket.io | 4.x | Temps réel |
| Prisma | 5.x | ORM |

### Structure du Projet

\`\`\`
src/
├── app/                    # Pages & API Routes
│   ├── (auth)/            # Routes authentification
│   ├── api/               # API Routes (BFF)
│   ├── dashboard/         # Dashboard utilisateur
│   └── admin/             # Admin panel
├── components/
│   ├── ui/                # Composants atomiques (Shadcn)
│   ├── report/            # Composants métier rapport
│   └── assist/            # Composants assistant IA
└── lib/
    ├── prisma.ts          # Prisma client
    ├── auth.ts            # NextAuth config
    └── utils.ts           # Utilitaires
\`\`\`

### Responsabilités par Composant

| Composant | Responsabilité |
|-----------|----------------|
| src/app/ | Routing & Pages (App Router) |
| src/app/api/ | API Routes (Proxy vers Backend Core) |
| src/components/ui/ | Composants réutilisables (Shadcn) |
| src/lib/prisma.ts | Connexion DB + Queries |
| middleware.ts | Auth check + RBAC |
`;
};

export const generateN8NMarkdown = () => {
  return `# N8N Infrastructure - AnalyzeTech

## Architecture N8N - Vue d'Ensemble

Infrastructure **N8N en mode Queue** avec séparation Main/Worker pour haute disponibilité et scalabilité horizontale. Déployée sur Ubuntu avec Docker Compose.

### Diagramme d'Architecture

\`\`\`mermaid
${N8NCharts.n8nArchitectureChart}
\`\`\`

### Services Principaux

- **Traefik**: Reverse proxy avec SSL automatique (Let's Encrypt)
- **N8N Main**: Interface UI + API. Concurrency: 0 (délègue tout)
- **N8N Worker**: Exécution workflows. Concurrency: 5 par worker
- **Redis Queue**: Bull MQ pour orchestration asynchrone

## Configuration Docker Compose

### Services Déployés
- **Traefik**: Reverse proxy (ports 80/443)
- **Redis**: Queue Bull MQ (port 6379)
- **N8N Main**: Interface + API (port 5678)
- **N8N Worker**: Exécution workflows

### Réseau & Volumes
- **Network**: n8n-net (bridge)
- **Volume Redis**: redis_data (persistance)
- **Volume Traefik**: ./letsencrypt (certificats SSL)

### docker-compose.yml (Extrait)
\`\`\`yaml
services:
  traefik:
    image: traefik:latest
    command:
      - "--providers.docker=true"
      - "--entryPoints.websecure.address=:443"
      - "--certificatesResolvers.myresolver.acme.httpChallenge.entryPoint=web"
    ports:
      - "80:80"
      - "443:443"

  redis:
    image: redis:6-alpine
    command: ["redis-server", "--appendonly", "yes"]

  n8n-main:
    image: n8nio/n8n:1.94.0
    env_file: .env
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(\`n8n.analyztech.com\`)"

  n8n-worker:
    image: n8nio/n8n:1.94.0
    command: ["worker", "--concurrency=5"]
    env_file: .env-worker
\`\`\`

## Configuration N8N Main (.env)

### Rôle du Main
Le Main sert **uniquement** l'interface UI et l'API. Il ne traite **aucun workflow** (N8N_CONCURRENCY_PRODUCTION_LIMIT_MAIN=0). Tous les workflows sont délégués aux workers via Redis.

### Database (PostgreSQL RDS)
- Host: eu-north-1.rds.amazonaws.com
- Database: n8n
- Pool Size: 15
- Timeout: 40s

### Queue Configuration
- Mode: queue
- Type: redis
- Host: redis:6379
- Main Concurrency: 0

### Variables Clés
\`\`\`env
# Database
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=core-db-instance-1-eu-north-1b.c3sc2kgwaxgs.eu-north-1.rds.amazonaws.com
DB_POSTGRESDB_POOL_SIZE=15

# Queue Mode
EXECUTIONS_MODE=queue
QUEUE_TYPE=redis
QUEUE_BULL_REDIS_HOST=redis

# Main ne traite RIEN
N8N_CONCURRENCY_PRODUCTION_LIMIT_MAIN=0
N8N_CONCURRENCY_PRODUCTION_LIMIT=40

# Offload manuel vers workers
OFFLOAD_MANUAL_EXECUTIONS_TO_WORKERS=true
\`\`\`

## Configuration N8N Worker (.env-worker)

### Rôle du Worker
Le Worker **exécute uniquement** les workflows. Il poll Redis pour récupérer les jobs et traite jusqu'à **5 workflows simultanément**. Scalable horizontalement (ajouter plus de workers).

### Métriques
- **Concurrency par Worker**: 5
- **Pool Size PostgreSQL**: 20
- **Connection Timeout**: 40s

### Variables Clés
\`\`\`env
# Database (partagée avec Main)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=core-db-instance-1-eu-north-1b.c3sc2kgwaxgs.eu-north-1.rds.amazonaws.com
DB_POSTGRESDB_POOL_SIZE=20

# Queue Mode
EXECUTIONS_MODE=queue
QUEUE_TYPE=redis
QUEUE_BULL_REDIS_HOST=redis

# Concurrency par worker
N8N_CONCURRENCY_PRODUCTION_LIMIT=5

# Task Runners (Code node)
N8N_RUNNERS_ENABLED=true
\`\`\`

## Flux d'Exécution (Webhook → Worker)

1. Client/Webhook: POST /webhook/xyz
2. Traefik: Forward Request
3. N8N Main: Save Execution (PENDING)
4. N8N Main → Redis: Enqueue Job
5. N8N Main → Client: 200 OK (Queued)
6. **Async Processing**:
   - Worker: Poll Job from Redis
   - Worker → DB: Update Status (RUNNING)
   - Worker: Execute Workflow
   - Worker → DB: Update Status (SUCCESS/ERROR)

### Timeouts Configurés
- **Traefik Read Timeout**: 1200s (20 min)
- **Traefik Idle Timeout**: 1200s (20 min)
- **N8N Trigger Timeout**: 30s

### Avantages Queue Mode
✅ Réponse immédiate au client (200 OK)
✅ Traitement asynchrone fiable
✅ Retry automatique en cas d'échec
✅ Scalabilité horizontale (+ workers)

## Scaling & Performance

### Métriques Actuelles
| Métrique | Valeur Actuelle | Capacité Théorique |
|----------|-----------------|-------------------|
| Workers Déployés | 1 | Scalable (Docker Compose scale) |
| Concurrency par Worker | 5 | 5 workflows simultanés |
| Capacité Totale (1 worker) | **5 workflows/s** | Limité par worker count |
| Limite Globale (Main) | 40 | Max workflows actifs (tous workers) |

### Pour Scaler Horizontalement
\`\`\`bash
# Ajouter 2 workers supplémentaires
docker-compose up -d --scale n8n-worker=3

# Capacité totale = 3 workers × 5 concurrency = 15 workflows simultanés
\`\`\`

## Routing & Domaines (Traefik)

### Domaine Principal
- **URL**: https://n8n.analyztech.com
- **Certificat SSL**: Automatique (Let's Encrypt)

### Ancien Domaine (Redirect)
- **URL**: https://n8n.ynor.tech
- **Redirection**: 301 permanente vers analyztech.com

## Architecture de Déploiement

### Infrastructure
- **Serveur**: Ubuntu (ynor-n8n)
- **Orchestration**: Docker Compose
- **Image N8N**: n8nio/n8n:1.94.0
- **Database**: AWS RDS PostgreSQL (eu-north-1)

### Sécurité
- **SSL/TLS**: Let's Encrypt (auto-renew)
- **Auth**: Basic Auth (admin/admin)
- **Encryption Key**: Partagée Main/Worker
- **DB SSL**: Désactivé (RDS interne)

## Monitoring & Troubleshooting

### Commandes Utiles
\`\`\`bash
# Voir les logs du worker
docker-compose logs -f n8n-worker

# Voir les logs du main
docker-compose logs -f n8n-main

# Redémarrer les services
docker-compose restart

# Vérifier l'état
docker-compose ps
\`\`\`

### Points de Vigilance
⚠️ **Redis Persistence**: Volume redis_data doit être sauvegardé
⚠️ **DB Pool Exhaustion**: Surveiller connexions actives
⚠️ **Worker Crashes**: Logs pour identifier workflows problématiques
⚠️ **Queue Health**: QUEUE_HEALTH_CHECK_ACTIVE=true
`;
};

export const generateAWSMarkdown = () => {
  return `# AWS Infrastructure - AnalyzeTech

## Infrastructure AWS - Vue d'Ensemble

Infrastructure complète déployée sur **AWS** avec CI/CD automatisé via **GitHub Actions**. Utilisation de services managés pour haute disponibilité et scalabilité.

### Diagramme d'Infrastructure

\`\`\`mermaid
${AWSCharts.awsInfrastructureChart}
\`\`\`

### Services Principaux

#### EC2 Instances
- **Frontend**: i-08f2379b303e0d7ce (eu-west-3)
- **Backend**: i-09479e83cf68b2de3 (eu-west-3)

#### RDS PostgreSQL
- **Instance**: core-db-instance
- **Region**: eu-north-1
- **Type**: Managé

#### S3 + ECR
- **S3**: Stockage fichiers
- **ECR**: Images Docker
- **Region**: eu-west-3

## Services AWS Utilisés

### Compute & Storage
- **EC2 (Elastic Compute Cloud)**: 2 instances Ubuntu avec Docker
- **ECR (Elastic Container Registry)**: Registre privé pour images Docker
- **S3 (Simple Storage Service)**: Stockage fichiers utilisateurs

### Database & Networking
- **RDS (Relational Database Service)**: PostgreSQL managé (eu-north-1)
- **Route 53**: DNS Management (analyztech.com)
- **VPC (Virtual Private Cloud)**: Isolation réseau

### Management & Security
- **Systems Manager (SSM)**: Exécution de commandes à distance sur EC2
- **IAM (Identity & Access Management)**: Gestion des accès et permissions

## Architecture EC2 & Déploiement

### Frontend EC2
- **Instance ID**: i-08f2379b303e0d7ce
- **Region**: eu-west-3
- **Application**: Next.js (Docker)
- **Domain**: analyztech.com

### Backend EC2
- **Instance ID**: i-09479e83cf68b2de3
- **Region**: eu-west-3
- **Application**: NestJS (Docker)
- **Domain**: api.analyztech.com

## CI/CD Pipeline (GitHub Actions)

### Déclenchement Automatique
Chaque \`git push\` sur la branche **prod** déclenche automatiquement le workflow de déploiement. Le processus est entièrement automatisé via GitHub Actions.

### Étapes du Pipeline
1. Checkout du code source
2. Configuration AWS credentials
3. Login à ECR
4. Build de l'image Docker
5. Push vers ECR (tag: latest)
6. Génération token ECR
7. Déploiement via SSM
8. Polling du statut (max 40min)

### Secrets GitHub
- \`AWS_ACCESS_KEY_ID\`
- \`AWS_SECRET_ACCESS_KEY\`
- \`AWS_REGION\`
- \`ECR_REGISTRY_HOST\`
- \`ECR_REPOSITORY_NAME\`

## Workflow de Déploiement Détaillé

### Flux Complet
1. Developer: git push origin prod
2. GitHub: Trigger Workflow
3. GitHub Actions: Checkout Code
4. GitHub Actions → ECR: Login (AWS Credentials)
5. GitHub Actions: docker build
6. GitHub Actions → ECR: docker push (latest tag)
7. GitHub Actions → SSM: send-command (deploy)
8. SSM → EC2: Execute Shell Script
9. EC2 → ECR: docker login
10. EC2 → ECR: docker compose pull
11. EC2: docker compose up -d
12. EC2: docker image prune -af
13. EC2 → SSM: Command Status (Success)
14. SSM → GitHub Actions: Deployment Complete

### Timeouts
- **GitHub Actions**: 45min
- **Polling SSM**: 40min
- **Intervalle de Polling**: 10s

## Commandes SSM Exécutées sur EC2

### AWS Systems Manager (SSM)
SSM permet d'exécuter des commandes shell à distance sur les instances EC2 sans SSH. Les commandes sont envoyées via l'API AWS et exécutées par l'agent SSM installé sur l'instance.

### Script de Déploiement
\`\`\`bash
# Exécuté sur l'instance EC2 via SSM
cd /home/ubuntu

# Connexion à ECR avec le token généré
echo "$ECR_TOKEN" | docker login --username AWS --password-stdin $ECR_REGISTRY_HOST

# Téléchargement des nouvelles images
docker compose pull

# Redémarrage des services
docker compose up -d

# Nettoyage des anciennes images
docker image prune -af

# Affichage de l'état
docker compose ps
\`\`\`

### Avantages SSM
✅ Pas besoin de SSH (sécurité accrue)
✅ Logs centralisés dans AWS
✅ Exécution asynchrone avec polling
✅ Retry automatique en cas d'échec

### Points de Vigilance
⚠️ Agent SSM doit être actif sur EC2
⚠️ Timeout max: 1800s (30min)
⚠️ Polling manuel nécessaire (40min)
⚠️ Vérifier les logs en cas d'échec

## Route 53 & Configuration DNS

### Enregistrements DNS Configurés
| Domaine | Type | Cible | TTL |
|---------|------|-------|-----|
| analyztech.com | A | 16.16.176.35 | 300 |
| api.analyztech.com | A | 16.16.225.18 | 300 |
| n8n.analyztech.com | A | 13.61.139.217 | 300 |

Route 53 gère le DNS pour le domaine **analyztech.com** avec 9 enregistrements (A, NS, SOA, TXT, CNAME). Les enregistrements A pointent directement vers les IPs publiques des instances EC2.

## Sécurité & IAM

### Permissions IAM
- **GitHub Actions**: ECR push/pull, SSM send-command
- **EC2 Instances**: ECR pull, S3 read/write, RDS connect
- **SSM Agent**: Exécution de commandes autorisées

### Bonnes Pratiques
✅ Secrets stockés dans GitHub Secrets
✅ Credentials AWS rotationnelles
✅ Principe du moindre privilège (IAM)
✅ VPC pour isolation réseau

## Monitoring & Troubleshooting

### Commandes Utiles (AWS CLI)
\`\`\`bash
# Vérifier le statut d'une commande SSM
aws ssm get-command-invocation \\
  --command-id CMD_ID \\
  --instance-id INSTANCE_ID

# Lister les instances EC2
aws ec2 describe-instances \\
  --filters "Name=tag:Name,Values=analyztech-*"

# Voir les logs CloudWatch
aws logs tail /aws/ssm/commands --follow
\`\`\`

### Points de Vigilance
⚠️ **Timeout GitHub Actions**: 45min max
⚠️ **Coûts EC2**: Instances toujours actives
⚠️ **RDS Multi-Region**: Latence eu-west-3 → eu-north-1
⚠️ **ECR Storage**: Nettoyer anciennes images
`;
};
