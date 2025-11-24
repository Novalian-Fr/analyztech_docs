import React from 'react';
import Section from './Section';
import MermaidDiagram from './MermaidDiagram';
import {
  Cloud, Server, Database, HardDrive, Globe, GitBranch,
  Shield, Zap, Activity, Box, Network, Lock, Code,
  CheckCircle, AlertTriangle, Clock, Terminal, Layers
} from 'lucide-react';
import * as Charts from '../data/awsCharts';

const CodeBlock = ({ code, language = 'yaml' }) => (
  <div className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm border border-slate-700 shadow-inner">
    <div className="text-xs text-slate-400 mb-2 select-none uppercase tracking-wider">{language}</div>
    <pre>{code.trim()}</pre>
  </div>
);

const AWSTab = () => {
  return (
    <div className="fade-in space-y-12">
      {/* 1. Vue d'Ensemble Infrastructure */}
      <Section title="1. Infrastructure AWS - Vue d'Ensemble" id="aws-overview">
        <p className="text-lg text-slate-600 mb-6">
          Infrastructure complète déployée sur <strong>AWS</strong> avec CI/CD automatisé via <strong>GitHub Actions</strong>.
          Utilisation de services managés pour haute disponibilité et scalabilité.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card">
            <div className="icon-box theme-orange mb-3">
              <Server size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">EC2 Instances</h3>
            <p className="text-sm text-slate-600">2 instances (Frontend + Backend) en eu-west-3</p>
            <div className="mt-3 space-y-1">
              <div className="text-xs font-mono text-indigo-600">i-08f2379b303e0d7ce (Front)</div>
              <div className="text-xs font-mono text-indigo-600">i-09479e83cf68b2de3 (Back)</div>
            </div>
          </div>
          <div className="glass-card">
            <div className="icon-box theme-blue mb-3">
              <Database size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">RDS PostgreSQL</h3>
            <p className="text-sm text-slate-600">Base de données managée en eu-north-1</p>
            <div className="mt-3 text-xs font-mono text-indigo-600">core-db-instance</div>
          </div>
          <div className="glass-card">
            <div className="icon-box theme-green mb-3">
              <HardDrive size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">S3 + ECR</h3>
            <p className="text-sm text-slate-600">Stockage fichiers + Images Docker</p>
            <div className="mt-3 text-xs font-mono text-indigo-600">eu-west-3</div>
          </div>
        </div>

        <MermaidDiagram chart={Charts.awsInfrastructureChart} id="aws-infra" />
      </Section>

      {/* 2. Services AWS Utilisés */}
      <Section title="2. Services AWS Utilisés" id="aws-services">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Cloud size={20} className="text-orange-500" /> Compute & Storage
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Server size={16} className="text-orange-500 mt-0.5" />
                <div>
                  <strong className="text-slate-900">EC2 (Elastic Compute Cloud)</strong>
                  <div className="text-xs text-slate-500">2 instances Ubuntu avec Docker</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Box size={16} className="text-orange-500 mt-0.5" />
                <div>
                  <strong className="text-slate-900">ECR (Elastic Container Registry)</strong>
                  <div className="text-xs text-slate-500">Registre privé pour images Docker</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <HardDrive size={16} className="text-green-500 mt-0.5" />
                <div>
                  <strong className="text-slate-900">S3 (Simple Storage Service)</strong>
                  <div className="text-xs text-slate-500">Stockage fichiers utilisateurs</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="glass-card">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Network size={20} className="text-blue-500" /> Database & Networking
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Database size={16} className="text-blue-500 mt-0.5" />
                <div>
                  <strong className="text-slate-900">RDS (Relational Database Service)</strong>
                  <div className="text-xs text-slate-500">PostgreSQL managé (eu-north-1)</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Globe size={16} className="text-violet-500 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Route 53</strong>
                  <div className="text-xs text-slate-500">DNS Management (analyztech.com)</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Shield size={16} className="text-red-500 mt-0.5" />
                <div>
                  <strong className="text-slate-900">VPC (Virtual Private Cloud)</strong>
                  <div className="text-xs text-slate-500">Isolation réseau</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="glass-card md:col-span-2">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-indigo-500" /> Management & Security
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Terminal size={16} className="text-orange-500 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Systems Manager (SSM)</strong>
                    <div className="text-xs text-slate-500">Exécution de commandes à distance sur EC2</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Lock size={16} className="text-red-500 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">IAM (Identity & Access Management)</strong>
                    <div className="text-xs text-slate-500">Gestion des accès et permissions</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <MermaidDiagram chart={Charts.awsServicesChart} id="aws-services-chart" />
      </Section>

      {/* 3. Architecture EC2 */}
      <Section title="3. Architecture EC2 & Déploiement" id="ec2-architecture">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card border-l-4 border-orange-500">
            <h4 className="font-bold text-orange-600 mb-3">Frontend EC2</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• <strong>Instance ID</strong>: <code className="text-xs">i-08f2379b303e0d7ce</code></li>
              <li>• <strong>Region</strong>: eu-west-3</li>
              <li>• <strong>Application</strong>: Next.js (Docker)</li>
              <li>• <strong>Domain</strong>: analyztech.com</li>
            </ul>
          </div>
          <div className="glass-card border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-600 mb-3">Backend EC2</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• <strong>Instance ID</strong>: <code className="text-xs">i-09479e83cf68b2de3</code></li>
              <li>• <strong>Region</strong>: eu-west-3</li>
              <li>• <strong>Application</strong>: NestJS (Docker)</li>
              <li>• <strong>Domain</strong>: api.analyztech.com</li>
            </ul>
          </div>
        </div>

        <MermaidDiagram chart={Charts.ec2ArchitectureChart} id="ec2-arch" />
      </Section>

      {/* 4. CI/CD Pipeline (GitHub Actions) */}
      <Section title="4. CI/CD Pipeline (GitHub Actions)" id="cicd-pipeline">
        <div className="glass-card mb-6 border-l-4 border-indigo-500">
          <h4 className="font-bold text-indigo-600 mb-2">Déclenchement Automatique</h4>
          <p className="text-sm text-slate-600">
            Chaque <code>git push</code> sur la branche <strong>prod</strong> déclenche automatiquement
            le workflow de déploiement. Le processus est entièrement automatisé via GitHub Actions.
          </p>
        </div>

        <MermaidDiagram chart={Charts.cicdPipelineChart} id="cicd-seq" />

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="glass-card">
            <h4 className="font-bold text-slate-900 mb-3">Étapes du Pipeline</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
              <li>Checkout du code source</li>
              <li>Configuration AWS credentials</li>
              <li>Login à ECR</li>
              <li>Build de l'image Docker</li>
              <li>Push vers ECR (tag: latest)</li>
              <li>Génération token ECR</li>
              <li>Déploiement via SSM</li>
              <li>Polling du statut (max 40min)</li>
            </ol>
          </div>
          <div className="glass-card">
            <h4 className="font-bold text-slate-900 mb-3">Secrets GitHub</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• <code className="text-xs">AWS_ACCESS_KEY_ID</code></li>
              <li>• <code className="text-xs">AWS_SECRET_ACCESS_KEY</code></li>
              <li>• <code className="text-xs">AWS_REGION</code></li>
              <li>• <code className="text-xs">ECR_REGISTRY_HOST</code></li>
              <li>• <code className="text-xs">ECR_REPOSITORY_NAME</code></li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 5. Workflow de Déploiement Détaillé */}
      <Section title="5. Workflow de Déploiement Détaillé" id="deployment-workflow">
        <MermaidDiagram chart={Charts.deploymentFlowChart} id="deploy-flow" />

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="glass-card text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-1">45min</div>
            <div className="text-xs text-slate-500">Timeout GitHub Actions</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">40min</div>
            <div className="text-xs text-slate-500">Timeout Polling SSM</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">10s</div>
            <div className="text-xs text-slate-500">Intervalle de Polling</div>
          </div>
        </div>
      </Section>

      {/* 6. Commandes SSM Exécutées */}
      <Section title="6. Commandes SSM Exécutées sur EC2" id="ssm-commands">
        <div className="glass-card mb-6 border-l-4 border-violet-500">
          <h4 className="font-bold text-violet-600 mb-2">AWS Systems Manager (SSM)</h4>
          <p className="text-sm text-slate-600">
            SSM permet d'exécuter des commandes shell à distance sur les instances EC2 sans SSH.
            Les commandes sont envoyées via l'API AWS et exécutées par l'agent SSM installé sur l'instance.
          </p>
        </div>

        <h4 className="text-md font-bold text-slate-800 mb-2">Script de Déploiement</h4>
        <CodeBlock language="bash" code={`
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
        `} />

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="glass-card border-l-4 border-green-500">
            <h4 className="font-bold text-green-600 mb-3 flex items-center gap-2">
              <CheckCircle size={20} /> Avantages SSM
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>✅ Pas besoin de SSH (sécurité accrue)</li>
              <li>✅ Logs centralisés dans AWS</li>
              <li>✅ Exécution asynchrone avec polling</li>
              <li>✅ Retry automatique en cas d'échec</li>
            </ul>
          </div>
          <div className="glass-card border-l-4 border-orange-500">
            <h4 className="font-bold text-orange-600 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} /> Points de Vigilance
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>⚠️ Agent SSM doit être actif sur EC2</li>
              <li>⚠️ Timeout max: 1800s (30min)</li>
              <li>⚠️ Polling manuel nécessaire (40min)</li>
              <li>⚠️ Vérifier les logs en cas d'échec</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 7. Route 53 & DNS */}
      <Section title="7. Route 53 & Configuration DNS" id="route53">
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th className="px-6 py-3 rounded-l-lg">Domaine</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Cible</th>
                <th className="px-6 py-3 rounded-r-lg">TTL</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b border-slate-100">
                <td className="px-6 py-4 font-mono text-indigo-600">analyztech.com</td>
                <td className="px-6 py-4">A</td>
                <td className="px-6 py-4 font-mono text-xs">16.16.176.35</td>
                <td className="px-6 py-4">300</td>
              </tr>
              <tr className="bg-white border-b border-slate-100">
                <td className="px-6 py-4 font-mono text-indigo-600">api.analyztech.com</td>
                <td className="px-6 py-4">A</td>
                <td className="px-6 py-4 font-mono text-xs">16.16.225.18</td>
                <td className="px-6 py-4">300</td>
              </tr>
              <tr className="bg-white border-b border-slate-100">
                <td className="px-6 py-4 font-mono text-indigo-600">n8n.analyztech.com</td>
                <td className="px-6 py-4">A</td>
                <td className="px-6 py-4 font-mono text-xs">13.61.139.217</td>
                <td className="px-6 py-4">300</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="glass-card">
          <h4 className="font-bold text-slate-900 mb-3">Enregistrements DNS Configurés</h4>
          <p className="text-sm text-slate-600 mb-4">
            Route 53 gère le DNS pour le domaine <strong>analyztech.com</strong> avec 9 enregistrements
            (A, NS, SOA, TXT, CNAME). Les enregistrements A pointent directement vers les IPs publiques des instances EC2.
          </p>
        </div>
      </Section>

      {/* 8. Sécurité & IAM */}
      <Section title="8. Sécurité & IAM" id="security">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card">
            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Lock size={20} className="text-red-500" /> Permissions IAM
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• <strong>GitHub Actions</strong>: ECR push/pull, SSM send-command</li>
              <li>• <strong>EC2 Instances</strong>: ECR pull, S3 read/write, RDS connect</li>
              <li>• <strong>SSM Agent</strong>: Exécution de commandes autorisées</li>
            </ul>
          </div>
          <div className="glass-card">
            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Shield size={20} className="text-green-500" /> Bonnes Pratiques
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>✅ Secrets stockés dans GitHub Secrets</li>
              <li>✅ Credentials AWS rotationnelles</li>
              <li>✅ Principe du moindre privilège (IAM)</li>
              <li>✅ VPC pour isolation réseau</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 9. Monitoring & Troubleshooting */}
      <Section title="9. Monitoring & Troubleshooting" id="aws-monitoring">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-600 mb-3">Commandes Utiles (AWS CLI)</h4>
            <CodeBlock language="bash" code={`
# Vérifier le statut d'une commande SSM
aws ssm get-command-invocation \\
  --command-id CMD_ID \\
  --instance-id INSTANCE_ID

# Lister les instances EC2
aws ec2 describe-instances \\
  --filters "Name=tag:Name,Values=analyztech-*"

# Voir les logs CloudWatch
aws logs tail /aws/ssm/commands --follow
            `} />
          </div>
          <div className="glass-card border-l-4 border-orange-500">
            <h4 className="font-bold text-orange-600 mb-3">Points de Vigilance</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>⚠️ <strong>Timeout GitHub Actions</strong>: 45min max</li>
              <li>⚠️ <strong>Coûts EC2</strong>: Instances toujours actives</li>
              <li>⚠️ <strong>RDS Multi-Region</strong>: Latence eu-west-3 → eu-north-1</li>
              <li>⚠️ <strong>ECR Storage</strong>: Nettoyer anciennes images</li>
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default AWSTab;
