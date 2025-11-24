import React from 'react';
import Section from './Section';
import MermaidDiagram from './MermaidDiagram';
import CopyMarkdownButton from './CopyMarkdownButton';
import {
  Server, Database, Layers, Zap, AlertTriangle,
  CheckCircle, Activity, Globe, Shield, Code, Settings,
  GitBranch, Box, HardDrive, Network, Clock
} from 'lucide-react';
import * as Charts from '../data/n8nCharts';
import { generateN8NMarkdown } from '../utils/markdownGenerator';

const CodeBlock = ({ code, language = 'yaml' }) => (
  <div className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm border border-slate-700 shadow-inner">
    <div className="text-xs text-slate-400 mb-2 select-none uppercase tracking-wider">{language}</div>
    <pre>{code.trim()}</pre>
  </div>
);

const N8NTab = () => {
  return (
    <div className="fade-in space-y-12">
      <CopyMarkdownButton generateMarkdown={generateN8NMarkdown} tabName="N8N" />

      {/* 1. Architecture Globale */}
      <Section title="1. Architecture N8N - Vue d'Ensemble" id="n8n-architecture">
        <p className="text-lg text-slate-600 mb-6">
          Infrastructure <strong>N8N en mode Queue</strong> avec séparation Main/Worker pour haute disponibilité
          et scalabilité horizontale. Déployée sur Ubuntu avec Docker Compose.
        </p>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card">
            <div className="icon-box theme-blue mb-3">
              <Globe size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Traefik</h3>
            <p className="text-sm text-slate-600">Reverse proxy avec SSL automatique (Let's Encrypt)</p>
          </div>
          <div className="glass-card">
            <div className="icon-box theme-violet mb-3">
              <Server size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">N8N Main</h3>
            <p className="text-sm text-slate-600">Interface UI + API. Concurrency: 0 (délègue tout)</p>
          </div>
          <div className="glass-card">
            <div className="icon-box theme-green mb-3">
              <Activity size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">N8N Worker</h3>
            <p className="text-sm text-slate-600">Exécution workflows. Concurrency: 5 par worker</p>
          </div>
          <div className="glass-card">
            <div className="icon-box theme-orange mb-3">
              <Database size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Redis Queue</h3>
            <p className="text-sm text-slate-600">Bull MQ pour orchestration asynchrone</p>
          </div>
        </div>

        <MermaidDiagram chart={Charts.n8nArchitectureChart} id="n8n-global-arch" />
      </Section>

      {/* 2. Configuration Docker Compose */}
      <Section title="2. Configuration Docker Compose" id="n8n-docker">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="glass-card">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Box size={20} className="text-indigo-500" /> Services Déployés
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• <strong>Traefik</strong>: Reverse proxy (ports 80/443)</li>
              <li>• <strong>Redis</strong>: Queue Bull MQ (port 6379)</li>
              <li>• <strong>N8N Main</strong>: Interface + API (port 5678)</li>
              <li>• <strong>N8N Worker</strong>: Exécution workflows</li>
            </ul>
          </div>
          <div className="glass-card">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Network size={20} className="text-emerald-500" /> Réseau & Volumes
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• <strong>Network</strong>: n8n-net (bridge)</li>
              <li>• <strong>Volume Redis</strong>: redis_data (persistance)</li>
              <li>• <strong>Volume Traefik</strong>: ./letsencrypt (certificats SSL)</li>
            </ul>
          </div>
        </div>

        <h4 className="text-md font-bold text-slate-800 mb-2">docker-compose.yml (Extrait)</h4>
        <CodeBlock code={`
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
        `} />
      </Section>

      {/* 3. Configuration N8N Main */}
      <Section title="3. Configuration N8N Main (.env)" id="n8n-main-config">
        <div className="glass-card mb-6 border-l-4 border-violet-500">
          <h4 className="font-bold text-violet-600 mb-2">Rôle du Main</h4>
          <p className="text-sm text-slate-600">
            Le Main sert <strong>uniquement</strong> l'interface UI et l'API. Il ne traite <strong>aucun workflow</strong>
            (<code>N8N_CONCURRENCY_PRODUCTION_LIMIT_MAIN=0</code>). Tous les workflows sont délégués aux workers via Redis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="glass-card">
            <h4 className="font-bold text-slate-900 mb-3">Database (PostgreSQL RDS)</h4>
            <ul className="space-y-1 text-xs font-mono text-slate-600">
              <li>• Host: <span className="text-indigo-600">eu-north-1.rds.amazonaws.com</span></li>
              <li>• Database: <span className="text-indigo-600">n8n</span></li>
              <li>• Pool Size: <span className="text-indigo-600">15</span></li>
              <li>• Timeout: <span className="text-indigo-600">40s</span></li>
            </ul>
          </div>
          <div className="glass-card">
            <h4 className="font-bold text-slate-900 mb-3">Queue Configuration</h4>
            <ul className="space-y-1 text-xs font-mono text-slate-600">
              <li>• Mode: <span className="text-green-600">queue</span></li>
              <li>• Type: <span className="text-green-600">redis</span></li>
              <li>• Host: <span className="text-green-600">redis:6379</span></li>
              <li>• Main Concurrency: <span className="text-red-600">0</span></li>
            </ul>
          </div>
        </div>

        <CodeBlock code={`
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
        `} />
      </Section>

      {/* 4. Configuration Worker */}
      <Section title="4. Configuration N8N Worker (.env-worker)" id="n8n-worker-config">
        <div className="glass-card mb-6 border-l-4 border-green-500">
          <h4 className="font-bold text-green-600 mb-2">Rôle du Worker</h4>
          <p className="text-sm text-slate-600">
            Le Worker <strong>exécute uniquement</strong> les workflows. Il poll Redis pour récupérer les jobs
            et traite jusqu'à <code>5 workflows simultanément</code>. Scalable horizontalement (ajouter plus de workers).
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">5</div>
            <div className="text-xs text-slate-500">Concurrency par Worker</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-1">20</div>
            <div className="text-xs text-slate-500">Pool Size PostgreSQL</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">40s</div>
            <div className="text-xs text-slate-500">Connection Timeout</div>
          </div>
        </div>

        <CodeBlock code={`
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
        `} />
      </Section>

      {/* 5. Flux d'Exécution */}
      <Section title="5. Flux d'Exécution (Webhook → Worker)" id="n8n-execution-flow">
        <MermaidDiagram chart={Charts.n8nExecutionFlowChart} id="n8n-execution" />

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="glass-card border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-600 mb-3 flex items-center gap-2">
              <Clock size={20} /> Timeouts Configurés
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• <strong>Traefik Read Timeout</strong>: 1200s (20 min)</li>
              <li>• <strong>Traefik Idle Timeout</strong>: 1200s (20 min)</li>
              <li>• <strong>N8N Trigger Timeout</strong>: 30s</li>
            </ul>
          </div>
          <div className="glass-card border-l-4 border-green-500">
            <h4 className="font-bold text-green-600 mb-3 flex items-center gap-2">
              <CheckCircle size={20} /> Avantages Queue Mode
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>✅ Réponse immédiate au client (200 OK)</li>
              <li>✅ Traitement asynchrone fiable</li>
              <li>✅ Retry automatique en cas d'échec</li>
              <li>✅ Scalabilité horizontale (+ workers)</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 6. Scaling & Performance */}
      <Section title="6. Scaling & Performance" id="n8n-scaling">
        <MermaidDiagram chart={Charts.n8nScalingChart} id="n8n-scaling-chart" />

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th className="px-6 py-3 rounded-l-lg">Métrique</th>
                <th className="px-6 py-3">Valeur Actuelle</th>
                <th className="px-6 py-3 rounded-r-lg">Capacité Théorique</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b border-slate-100">
                <td className="px-6 py-4 font-medium text-slate-900">Workers Déployés</td>
                <td className="px-6 py-4">1</td>
                <td className="px-6 py-4 text-green-600">Scalable (Docker Compose scale)</td>
              </tr>
              <tr className="bg-white border-b border-slate-100">
                <td className="px-6 py-4 font-medium text-slate-900">Concurrency par Worker</td>
                <td className="px-6 py-4">5</td>
                <td className="px-6 py-4">5 workflows simultanés</td>
              </tr>
              <tr className="bg-white border-b border-slate-100">
                <td className="px-6 py-4 font-medium text-slate-900">Capacité Totale (1 worker)</td>
                <td className="px-6 py-4 font-bold text-indigo-600">5 workflows/s</td>
                <td className="px-6 py-4">Limité par worker count</td>
              </tr>
              <tr className="bg-white border-b border-slate-100">
                <td className="px-6 py-4 font-medium text-slate-900">Limite Globale (Main)</td>
                <td className="px-6 py-4">40</td>
                <td className="px-6 py-4">Max workflows actifs (tous workers)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="glass-card mt-6 border-l-4 border-orange-500">
          <h4 className="font-bold text-orange-600 mb-2 flex items-center gap-2">
            <AlertTriangle size={20} /> Pour Scaler Horizontalement
          </h4>
          <CodeBlock language="bash" code={`
# Ajouter 2 workers supplémentaires
docker-compose up -d --scale n8n-worker=3

# Capacité totale = 3 workers × 5 concurrency = 15 workflows simultanés
          `} />
        </div>
      </Section>

      {/* 7. Routing & Domaines */}
      <Section title="7. Routing & Domaines (Traefik)" id="n8n-routing">
        <MermaidDiagram chart={Charts.n8nDomainRoutingChart} id="n8n-routing-chart" />

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="glass-card">
            <h4 className="font-bold text-slate-900 mb-3">Domaine Principal</h4>
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <code className="text-sm font-mono text-indigo-600">https://n8n.analyztech.com</code>
            </div>
            <p className="text-xs text-slate-500 mt-2">Certificat SSL automatique (Let's Encrypt)</p>
          </div>
          <div className="glass-card">
            <h4 className="font-bold text-slate-900 mb-3">Ancien Domaine (Redirect)</h4>
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <code className="text-sm font-mono text-orange-600">https://n8n.ynor.tech</code>
            </div>
            <p className="text-xs text-slate-500 mt-2">Redirection 301 permanente vers analyztech.com</p>
          </div>
        </div>
      </Section>

      {/* 8. Déploiement */}
      <Section title="8. Architecture de Déploiement" id="n8n-deployment">
        <MermaidDiagram chart={Charts.n8nDeploymentChart} id="n8n-deploy-chart" />

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="glass-card">
            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Server size={20} className="text-blue-500" /> Infrastructure
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• <strong>Serveur</strong>: Ubuntu (ynor-n8n)</li>
              <li>• <strong>Orchestration</strong>: Docker Compose</li>
              <li>• <strong>Image N8N</strong>: n8nio/n8n:1.94.0</li>
              <li>• <strong>Database</strong>: AWS RDS PostgreSQL (eu-north-1)</li>
            </ul>
          </div>
          <div className="glass-card">
            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Shield size={20} className="text-green-500" /> Sécurité
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• <strong>SSL/TLS</strong>: Let's Encrypt (auto-renew)</li>
              <li>• <strong>Auth</strong>: Basic Auth (admin/admin)</li>
              <li>• <strong>Encryption Key</strong>: Partagée Main/Worker</li>
              <li>• <strong>DB SSL</strong>: Désactivé (RDS interne)</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 9. Monitoring & Troubleshooting */}
      <Section title="9. Monitoring & Troubleshooting" id="n8n-monitoring">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-600 mb-3">Commandes Utiles</h4>
            <CodeBlock language="bash" code={`
# Voir les logs du worker
docker-compose logs -f n8n-worker

# Voir les logs du main
docker-compose logs -f n8n-main

# Redémarrer les services
docker-compose restart

# Vérifier l'état
docker-compose ps
            `} />
          </div>
          <div className="glass-card border-l-4 border-orange-500">
            <h4 className="font-bold text-orange-600 mb-3">Points de Vigilance</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>⚠️ <strong>Redis Persistence</strong>: Volume redis_data doit être sauvegardé</li>
              <li>⚠️ <strong>DB Pool Exhaustion</strong>: Surveiller connexions actives</li>
              <li>⚠️ <strong>Worker Crashes</strong>: Logs pour identifier workflows problématiques</li>
              <li>⚠️ <strong>Queue Health</strong>: QUEUE_HEALTH_CHECK_ACTIVE=true</li>
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default N8NTab;
