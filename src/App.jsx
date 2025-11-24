import React, { useState } from 'react';
import BackendTab from './components/BackendTab';
import FrontendTab from './components/FrontendTab';
import N8NTab from './components/N8NTab';
import AWSTab from './components/AWSTab';
import { Zap } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('backend');

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-bg"></div>
        <div className="container text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-6">
            <Zap size={16} /> AnalyzeTech Documentation
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-slate-900">
            Architecture <span className="gradient-text">Technique</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Documentation complète de l'architecture Backend et Frontend.
          </p>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="container sticky top-4 z-50">
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'backend' ? 'active' : ''}`}
            onClick={() => setActiveTab('backend')}
          >
            Backend Architecture
          </button>
          <button
            className={`tab-button ${activeTab === 'frontend' ? 'active' : ''}`}
            onClick={() => setActiveTab('frontend')}
          >
            Frontend Architecture
          </button>
          <button
            className={`tab-button ${activeTab === 'n8n' ? 'active' : ''}`}
            onClick={() => setActiveTab('n8n')}
          >
            N8N Infrastructure
          </button>
          <button
            className={`tab-button ${activeTab === 'aws' ? 'active' : ''}`}
            onClick={() => setActiveTab('aws')}
          >
            AWS Infrastructure
          </button>
        </div>
      </div>

      {/* Backend Content */}
      {activeTab === 'backend' && <BackendTab />}

      {/* Frontend Content */}
      {activeTab === 'frontend' && <FrontendTab />}

      {/* N8N Content */}
      {activeTab === 'n8n' && <N8NTab />}

      {/* AWS Content */}
      {activeTab === 'aws' && <AWSTab />}

      <footer className="py-12 text-center text-slate-400 text-sm">
        <p>Documentation générée par Antigravity pour AnalyzeTech.</p>
      </footer>
    </div>
  );
}

export default App;
