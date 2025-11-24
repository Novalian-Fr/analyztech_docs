import React from 'react';
import Section from './Section';
import MermaidDiagram from './MermaidDiagram';
import CopyMarkdownButton from './CopyMarkdownButton';
import {
  Layout, Folder, Globe, Shield, Database, Zap, AlertTriangle,
  Lock, Code, Server, Activity, FileText, Layers, ArrowRight,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import * as Charts from '../data/frontendCharts';
import { generateFrontendMarkdown } from '../utils/markdownGenerator';

const CodeBlock = ({ code, language = 'typescript' }) => (
  <div className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm border border-slate-700 shadow-inner">
    <div className="text-xs text-slate-400 mb-2 select-none uppercase tracking-wider">{language}</div>
    <pre>{code.trim()}</pre>
  </div>
);

const FrontendTab = () => {
  return (
    <div className="fade-in space-y-12">
      <CopyMarkdownButton generateMarkdown={generateFrontendMarkdown} tabName="Frontend" />

      {/* 1. Architecture Globale */}
      <Section title="1. Architecture Globale & Flux" id="frontend-architecture">
        <p className="text-lg text-slate-600 mb-6">
          L'application s'articule autour de trois blocs majeurs : le <strong>Client (Browser)</strong>,
          le <strong>Serveur Next.js (BFF)</strong>, et le <strong>Backend Core (API Report)</strong>.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card">
            <div className="icon-box theme-blue mb-3">
              <Globe size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Next.js (App Router)</h3>
            <p className="text-sm text-slate-600">Orchestrateur & UI. Sert le HTML, gère le routing, et sécurise les appels.</p>
          </div>
          <div className="glass-card">
            <div className="icon-box theme-violet mb-3">
              <Server size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">API Routes (/api/*)</h3>
            <p className="text-sm text-slate-600">Proxy Intelligent. Enrichit les requêtes (Auth context) avant de les passer au Backend.</p>
          </div>
          <div className="glass-card">
            <div className="icon-box theme-red mb-3">
              <Activity size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Backend Core</h3>
            <p className="text-sm text-slate-600">Moteur Métier. Traitement lourd, IA, Génération de fichiers, Stockage vectoriel.</p>
          </div>
        </div>

        <MermaidDiagram chart={Charts.globalArchitectureFrontendChart} id="frontend-global-arch" />
      </Section>

      {/* 2. Workflows Détaillés */}
      <Section title="2. Workflows Détaillés" id="frontend-workflows">
        <div className="space-y-12">
          {/* A. Création de Projet */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText size={24} className="text-indigo-500" />
              A. Création de Projet (Transaction Distribuée)
            </h3>
            <div className="glass-card mb-6 border-l-4 border-orange-500">
              <p className="text-sm text-slate-600">
                <strong className="text-orange-600">⚠️ Workflow Critique</strong> : Implique une synchronisation entre le Backend Core et la base locale PostgreSQL.
              </p>
            </div>
            <MermaidDiagram chart={Charts.projectCreationWorkflowChart} id="project-creation" />
          </div>

          {/* B. Middleware & Sécurité */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield size={24} className="text-green-500" />
              B. Middleware & Sécurité
            </h3>
            <div className="glass-card mb-6">
              <h4 className="font-bold text-slate-900 mb-3">Configuration</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><strong>Scope</strong>: <code>/dashboard/*</code>, <code>/admin/*</code>, <code>/auth/signin</code></li>
                <li><strong>Logique</strong>:
                  <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                    <li>Vérifie le Token JWT (<code>next-auth</code>)</li>
                    <li><strong>Admin Check</strong>: Si route <code>/admin</code>, vérifie <code>token.role === "SUPERADMIN"</code></li>
                    <li><strong>Auth Check</strong>: Si route protégée et pas de token → Redirect <code>/auth/signin</code></li>
                  </ol>
                </li>
              </ul>
            </div>
            <MermaidDiagram chart={Charts.middlewareFlowChart} id="middleware-flow" />
          </div>

          {/* C. Data Fetching */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Database size={24} className="text-blue-500" />
              C. Flux de Données (React Query)
            </h3>
            <MermaidDiagram chart={Charts.dataFetchingFlowChart} id="data-fetching" />
          </div>

          {/* D. Realtime Editing */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap size={24} className="text-yellow-500" />
              D. Édition Temps Réel (Socket.io)
            </h3>
            <MermaidDiagram chart={Charts.realtimeEditingFlowChart} id="realtime-editing" />
          </div>
        </div>
      </Section>

      {/* 3. Points d'Attention & Bottlenecks */}
      <Section title="3. Points d'Attention & Bottlenecks" id="frontend-bottlenecks">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th className="px-6 py-3 rounded-l-lg">Zone</th>
                <th className="px-6 py-3">Risque</th>
                <th className="px-6 py-3 rounded-r-lg">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b border-slate-100">
                <td className="px-6 py-4 font-medium text-slate-900">Next.js Serverless Timeout</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                    <AlertTriangle size={14} /> Élevé
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  Les routes API tournent sur Vercel/Node avec timeout (10s-60s). Les appels longs au Backend risquent de timeout.
                </td>
              </tr>
              <tr className="bg-white border-b border-slate-100">
                <td className="px-6 py-4 font-medium text-slate-900">Latence "Double Hop"</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">
                    <AlertCircle size={14} /> Moyen
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  Chaque requête traverse Client → Next.js → Backend. Ajoute latence réseau à chaque interaction.
                </td>
              </tr>
              <tr className="bg-white border-b border-slate-100">
                <td className="px-6 py-4 font-medium text-slate-900">Cohérence des Données</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">
                    <AlertCircle size={14} /> Moyen
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  Création projet non transactionnelle entre systèmes. Risque de "Projet orphelin" côté Backend.
                </td>
              </tr>
              <tr className="bg-white border-b border-slate-100">
                <td className="px-6 py-4 font-medium text-slate-900">Connexions Prisma</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">
                    <AlertCircle size={14} /> Moyen
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  En Serverless, chaque requête ouvre une connexion DB. Risque de "Connection Pool Exhaustion".
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="glass-card border-l-4 border-green-500">
            <h4 className="font-bold text-green-600 mb-3 flex items-center gap-2">
              <CheckCircle size={20} /> Solutions Recommandées
            </h4>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
              <li><strong>Streaming</strong>: Utiliser Server-Sent Events pour appels longs</li>
              <li><strong>Connection Pooling</strong>: PgBouncer ou Prisma Data Proxy</li>
              <li><strong>Saga Pattern</strong>: Compensation automatique si échec partiel</li>
              <li><strong>Cache</strong>: Redis pour réduire appels Backend</li>
            </ul>
          </div>
          <div className="glass-card border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-600 mb-3 flex items-center gap-2">
              <Activity size={20} /> Monitoring Clés
            </h4>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
              <li>Latence P95 des API Routes</li>
              <li>Taux d'erreur 504 (Gateway Timeout)</li>
              <li>Nombre de connexions Prisma actives</li>
              <li>Cache hit rate (si Redis)</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 4. Zones Sensibles */}
      <Section title="4. Zones Sensibles (Code & Config)" id="frontend-sensitive">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-4 text-orange-500">
              <Lock size={24} />
              <h3 className="text-lg font-bold m-0 text-slate-900">Environment Variables</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <code className="text-xs font-mono text-slate-700">REPORT_API_URL</code>
                <p className="text-xs text-slate-500 mt-1">URL critique du Backend Core</p>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <code className="text-xs font-mono text-slate-700">NEXT_PUBLIC_REPORT_API_KEY</code>
                <p className="text-xs text-red-500 mt-1">
                  ⚠️ Préfixée NEXT_PUBLIC, exposée au client. Devrait rester côté serveur uniquement.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="flex items-center gap-3 mb-4 text-indigo-500">
              <Shield size={24} />
              <h3 className="text-lg font-bold m-0 text-slate-900">Gestion des Rôles (RBAC)</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Défini dans <code>prisma/schema.prisma</code> (<code>enum UserRole</code>)</li>
              <li>• Appliqué dans <code>middleware.ts</code> et API Routes</li>
              <li className="text-orange-600">
                <strong>Optimisation</strong>: Centraliser la logique de permission (ex: <code>canUser(action, resource)</code>)
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 5. Modèle de Données */}
      <Section title="5. Modèle de Données (ERD)" id="frontend-erd">
        <MermaidDiagram chart={Charts.erdFrontendChart} id="frontend-erd-chart" />
      </Section>

      {/* 6. Stack & Responsabilités */}
      <Section title="6. Stack & Responsabilités" id="frontend-stack">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-4 text-indigo-500">
              <Layout size={24} />
              <h3 className="text-xl font-bold m-0 text-slate-900">Technologies Frontend</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">Framework</span>
                <span className="font-mono text-sm text-indigo-600">Next.js 15 (App Router)</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">UI Kit</span>
                <span className="font-mono text-sm text-indigo-600">Shadcn/ui + Tailwind</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">Data Fetching</span>
                <span className="font-mono text-sm text-indigo-600">React Query</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">Auth</span>
                <span className="font-mono text-sm text-indigo-600">NextAuth.js</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">Realtime</span>
                <span className="font-mono text-sm text-indigo-600">Socket.io</span>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div className="flex items-center gap-3 mb-4 text-emerald-500">
              <Folder size={24} />
              <h3 className="text-xl font-bold m-0 text-slate-900">Structure du Projet</h3>
            </div>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex gap-3">
                <code className="text-emerald-600 h-fit bg-emerald-50 border-emerald-100">src/app/</code>
                <div>
                  <strong className="block text-slate-900">Pages & Routes API</strong>
                  <span className="text-slate-500">App Router. <code>(auth)</code> pour auth, <code>api/</code> pour backend.</span>
                </div>
              </li>
              <li className="flex gap-3">
                <code className="text-emerald-600 h-fit bg-emerald-50 border-emerald-100">src/components/</code>
                <div>
                  <strong className="block text-slate-900">Interface Utilisateur</strong>
                  <span className="text-slate-500"><code>ui/</code> (atomique) et composants métiers.</span>
                </div>
              </li>
              <li className="flex gap-3">
                <code className="text-emerald-600 h-fit bg-emerald-50 border-emerald-100">src/lib/</code>
                <div>
                  <strong className="block text-slate-900">Cœur Logique</strong>
                  <span className="text-slate-500">Prisma, Auth, utilitaires partagés.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th className="px-6 py-3 rounded-l-lg">Composant</th>
                <th className="px-6 py-3 rounded-r-lg">Rôle Technique</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b border-slate-100">
                <td className="px-6 py-4 font-medium text-slate-900">Next.js (App Router)</td>
                <td className="px-6 py-4"><strong>Orchestrateur & UI</strong>. Sert le HTML, gère le routing, et sécurise les appels.</td>
              </tr>
              <tr className="bg-white border-b border-slate-100">
                <td className="px-6 py-4 font-medium text-slate-900">API Routes (/api/*)</td>
                <td className="px-6 py-4"><strong>Proxy Intelligent</strong>. Enrichit les requêtes (Auth context) avant de les passer au Backend.</td>
              </tr>
              <tr className="bg-white border-b border-slate-100">
                <td className="px-6 py-4 font-medium text-slate-900">Backend Core</td>
                <td className="px-6 py-4"><strong>Moteur Métier</strong>. Traitement lourd, IA, Génération de fichiers, Stockage vectoriel.</td>
              </tr>
              <tr className="bg-white border-b border-slate-100">
                <td className="px-6 py-4 font-medium text-slate-900">PostgreSQL</td>
                <td className="px-6 py-4"><strong>Méta-données</strong>. Stocke les relations utilisateurs, droits d'accès, et l'état "léger" des projets.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
};

export default FrontendTab;
