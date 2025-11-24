import React from 'react';
import Section from './Section';
import MermaidDiagram from './MermaidDiagram';
import CopyMarkdownButton from './CopyMarkdownButton';
import {
  Database, HardDrive, Network, Box, Globe, Brain, ScanText, Workflow,
  ShieldCheck, Layers, Server, Code, Lock, AlertTriangle, Terminal,
  Cpu, Activity, FileText, Zap, MessageSquare, Briefcase
} from 'lucide-react';
import * as Charts from '../data/backendCharts';
import { generateBackendMarkdown } from '../utils/markdownGenerator';

const CodeBlock = ({ code, language = 'typescript' }) => (
  <div className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm border border-slate-700 shadow-inner">
    <div className="text-xs text-slate-400 mb-2 select-none uppercase tracking-wider">{language}</div>
    <pre>{code.trim()}</pre>
  </div>
);

const BackendTab = () => {
  return (
    <div className="fade-in space-y-12">
      <CopyMarkdownButton generateMarkdown={generateBackendMarkdown} tabName="Backend" />

      {/* 1. Architecture Globale */}
      <Section title="1. Architecture Globale" id="architecture">
        <p className="text-lg text-slate-600 mb-6">
          Le backend est construit avec <strong>NestJS</strong> et suit une architecture modulaire en couches (Controller → Service → Repository → Database).
          Il interagit avec plusieurs services externes pour le stockage, l'IA, et l'orchestration de workflows.
        </p>

        <div className="grid-4 mb-8">
           {/* Database */}
           <div className="glass-card flex flex-col items-start hover-border-indigo transition-colors">
            <div className="icon-box theme-emerald">
              <Database size={24} />
            </div>
            <h3 className="text-lg font-bold mb-1 text-slate-900">PostgreSQL</h3>
            <p className="text-xs font-mono text-indigo-500 mb-2">Prisma ORM v6.4</p>
            <p className="text-sm text-slate-600">Stockage relationnel, pgvector & ltree.</p>
          </div>

          {/* Storage */}
          <div className="glass-card flex flex-col items-start hover-border-indigo transition-colors">
            <div className="icon-box theme-orange">
              <HardDrive size={24} />
            </div>
            <h3 className="text-lg font-bold mb-1 text-slate-900">AWS S3</h3>
            <p className="text-xs font-mono text-indigo-500 mb-2">eu-west-3</p>
            <p className="text-sm text-slate-600">Stockage sécurisé des fichiers bruts.</p>
          </div>

          {/* Vector DB */}
          <div className="glass-card flex flex-col items-start hover-border-indigo transition-colors">
            <div className="icon-box theme-pink">
              <Network size={24} />
            </div>
            <h3 className="text-lg font-bold mb-1 text-slate-900">Pinecone</h3>
            <p className="text-xs font-mono text-indigo-500 mb-2">Serverless</p>
            <p className="text-sm text-slate-600">Indexation vectorielle sémantique.</p>
          </div>

          {/* AI */}
          <div className="glass-card flex flex-col items-start hover-border-indigo transition-colors">
            <div className="icon-box theme-green">
              <Brain size={24} />
            </div>
            <h3 className="text-lg font-bold mb-1 text-slate-900">AI Models</h3>
            <p className="text-xs font-mono text-indigo-500 mb-2">OpenAI / Claude / Gemini</p>
            <p className="text-sm text-slate-600">Embeddings, Chat & Génération.</p>
          </div>
        </div>

        <MermaidDiagram chart={Charts.globalArchitectureChart} id="global-arch" />
      </Section>

      {/* 2. Schéma de Base de Données */}
      <Section title="2. Schéma de Base de Données" id="database">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Database size={20} className="text-emerald-500" /> Extensions PostgreSQL
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><strong className="text-slate-800">pgvector</strong>: Stockage vecteurs (1536 dims)</li>
              <li><strong className="text-slate-800">ltree</strong>: Structure hiérarchique (Chat)</li>
            </ul>
          </div>
          <div className="glass-card">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers size={20} className="text-indigo-500" /> Modèles Principaux
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Organization', 'Project', 'Document', 'Chunk', 'Embedding', 'Chat', 'Deliverable'].map(m => (
                <span key={m} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono border border-slate-200">{m}</span>
              ))}
            </div>
          </div>
        </div>

        <h4 className="text-md font-bold text-slate-800 mb-2">Modèle Document (Extrait)</h4>
        <CodeBlock code={`
model Document {
  id          String   @id @default(uuid())
  filename    String
  status      Status   @default(DRAFT) // DRAFT -> PENDING -> NORMALIZING -> PROGRESS -> COMPLETED
  content     Json?    @default("{}")

  // Métadonnées AI
  ai_metadata Json?    @default("{}")

  // Relations
  chunks      Chunk[]
  project     Project  @relation(...)
}
        `} />
      </Section>

      {/* 3. Architecture NestJS */}
      <Section title="3. Architecture NestJS" id="nestjs">
        <p className="mb-4 text-slate-600">Pattern architectural en couches : <strong>Controller → Service → Repository → Database</strong>.</p>
        <div className="glass-card bg-slate-50 mb-6">
          <CodeBlock code={`
// documents.controller.ts
@Controller('documents')
@UseGuards(ApiKeyGuard)
export class DocumentsController {
  @Post('confirm-multiple-uploads')
  async confirmMultipleUploads(@Body() dto, @Organization() org) {
    return this.documentsService.confirmMultipleUploads(dto, org.id);
  }
}
          `} />
        </div>
      </Section>

      {/* 5. Workflow confirmMultipleUploads */}
      <Section title="5. Workflow confirmMultipleUploads" id="workflow-upload">
        <div className="space-y-12">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">1</span>
              Phase 1 : Réception (Synchrone)
            </h3>
            <MermaidDiagram chart={Charts.confirmUploadsPhase1Chart} id="phase1" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm">2</span>
              Phase 2 : Traitement Asynchrone
            </h3>
            <div className="glass-card mb-6 border-l-4 border-violet-500">
              <h4 className="font-bold text-slate-900 mb-2">Gestion de la Concurrence</h4>
              <p className="text-sm text-slate-600">
                Utilisation de sémaphores pour limiter la charge :
                <br/>• <strong>Global</strong> : Max tâches simultanées serveur.
                <br/>• <strong>Projet</strong> : Max documents simultanés par projet.
              </p>
            </div>
            <MermaidDiagram chart={Charts.confirmUploadsPhase2Chart} id="phase2" />
          </div>
        </div>
      </Section>

      {/* 3. Cycle de Vie (State Diagram) */}
      <Section title="Cycle de Vie du Document" id="lifecycle">
        <MermaidDiagram chart={Charts.documentLifecycleChart} id="lifecycle-chart" />
      </Section>

      {/* 16. Workflows Détaillés */}
      <Section title="Workflows Détaillés" id="detailed-workflows">
        <div className="space-y-16">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText size={24} className="text-blue-500" /> Upload & Indexation Complet
            </h3>
            <MermaidDiagram chart={Charts.workflowUploadIndexationChart} id="workflow-full-index" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase size={24} className="text-orange-500" /> Génération de Livrable (Strategy Pattern)
            </h3>
            <MermaidDiagram chart={Charts.workflowDeliverableChart} id="workflow-deliverable" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare size={24} className="text-green-500" /> Chat & Streaming (AI SDK v5)
            </h3>
            <MermaidDiagram chart={Charts.workflowChatChart} id="workflow-chat" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={24} className="text-red-500" /> Suppression de Document
            </h3>
            <MermaidDiagram chart={Charts.workflowDeleteChart} id="workflow-delete" />
          </div>
        </div>
      </Section>

      {/* 9. Diagrammes d'Architecture */}
      <Section title="Diagrammes d'Architecture" id="arch-diagrams">
        <div className="grid md:grid-cols-1 gap-8">
            <div>
                <h3 className="font-bold text-slate-900 mb-4">Diagramme de Déploiement</h3>
                <MermaidDiagram chart={Charts.deploymentDiagram} id="deploy-diag" />
            </div>
            <div>
                <h3 className="font-bold text-slate-900 mb-4">Flow de Données (Indexation)</h3>
                <MermaidDiagram chart={Charts.dataFlowIndexationChart} id="dataflow-diag" />
            </div>
        </div>
      </Section>

      {/* 14. Bottlenecks & Optimisations */}
      <Section title="Bottlenecks & Optimisations" id="bottlenecks">
        <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card border-l-4 border-red-500">
                <h3 className="font-bold text-red-600 mb-2 flex items-center gap-2"><AlertTriangle size={20}/> Critiques (Semaine 1)</h3>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-2">
                    <li><strong>Queue en Mémoire</strong>: Risque perte de données. Migration vers Redis/BullMQ requise.</li>
                    <li><strong>Connection Pool</strong>: Saturation à 10 connexions. Augmenter à 50.</li>
                    <li><strong>Presigned URLs</strong>: Upload direct S3 pour réduire charge backend.</li>
                </ul>
            </div>
            <div className="glass-card border-l-4 border-yellow-500">
                <h3 className="font-bold text-yellow-600 mb-2 flex items-center gap-2"><Activity size={20}/> Haute Priorité</h3>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-2">
                    <li><strong>N8N Backpressure</strong>: Passage en asynchrone (Queue Redis).</li>
                    <li><strong>Rate Limiting</strong>: Global et par API Key.</li>
                    <li><strong>Parallélisation Pinecone</strong>: Upsert par batches parallèles.</li>
                </ul>
            </div>
        </div>
      </Section>

      {/* 11. Sécurité */}
      <Section title="Sécurité" id="security">
        <div className="grid md:grid-cols-3 gap-4">
            <div className="glass-card">
                <Lock size={24} className="text-indigo-500 mb-2" />
                <h4 className="font-bold text-slate-900">Authentification</h4>
                <p className="text-xs text-slate-600">ApiKeyGuard sur toutes les routes. Validation organisation/projet.</p>
            </div>
            <div className="glass-card">
                <ShieldCheck size={24} className="text-indigo-500 mb-2" />
                <h4 className="font-bold text-slate-900">Validation</h4>
                <p className="text-xs text-slate-600">DTOs avec class-validator. Sanitization des inputs.</p>
            </div>
            <div className="glass-card">
                <Terminal size={24} className="text-indigo-500 mb-2" />
                <h4 className="font-bold text-slate-900">Secrets</h4>
                <p className="text-xs text-slate-600">Variables d'env (.env). Rotation des clés recommandée.</p>
            </div>
        </div>
      </Section>

      {/* 12. Stack Technique */}
      <Section title="Stack Technique Complète" id="stack">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                    <tr>
                        <th className="px-6 py-3 rounded-l-lg">Catégorie</th>
                        <th className="px-6 py-3">Technologie</th>
                        <th className="px-6 py-3 rounded-r-lg">Version</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="bg-white border-b border-slate-100">
                        <td className="px-6 py-4 font-medium text-slate-900">Framework</td>
                        <td className="px-6 py-4">NestJS</td>
                        <td className="px-6 py-4 font-mono text-xs">11.0.1</td>
                    </tr>
                    <tr className="bg-white border-b border-slate-100">
                        <td className="px-6 py-4 font-medium text-slate-900">Runtime</td>
                        <td className="px-6 py-4">Node.js / TypeScript</td>
                        <td className="px-6 py-4 font-mono text-xs">5.7.3</td>
                    </tr>
                    <tr className="bg-white border-b border-slate-100">
                        <td className="px-6 py-4 font-medium text-slate-900">Database</td>
                        <td className="px-6 py-4">PostgreSQL + Prisma</td>
                        <td className="px-6 py-4 font-mono text-xs">6.4.1</td>
                    </tr>
                    <tr className="bg-white border-b border-slate-100">
                        <td className="px-6 py-4 font-medium text-slate-900">AI Embeddings</td>
                        <td className="px-6 py-4">OpenAI text-embedding-3-large</td>
                        <td className="px-6 py-4 font-mono text-xs">1536 dims</td>
                    </tr>
                     <tr className="bg-white border-b border-slate-100">
                        <td className="px-6 py-4 font-medium text-slate-900">Vector DB</td>
                        <td className="px-6 py-4">Pinecone</td>
                        <td className="px-6 py-4 font-mono text-xs">Serverless</td>
                    </tr>
                </tbody>
            </table>
        </div>
      </Section>
    </div>
  );
};

export default BackendTab;
