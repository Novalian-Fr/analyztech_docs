import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import mermaid from 'mermaid';
import { X, Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// Initialize with a base theme that is definitely light
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  fontFamily: 'Inter',
  themeVariables: {
    darkMode: false,
    background: '#ffffff',
    primaryColor: '#e0e7ff', // Light Indigo
    primaryTextColor: '#0f172a', // Slate 900
    primaryBorderColor: '#6366f1', // Indigo 500
    lineColor: '#64748b', // Slate 500
    secondaryColor: '#f8fafc', // Slate 50
    tertiaryColor: '#ffffff',
    noteBkgColor: '#fef3c7', // Amber 100
    noteTextColor: '#0f172a',
    fontSize: '14px',
  }
});

const MermaidDiagram = ({ chart, id }) => {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        // We need to reset/re-initialize if we want to be 100% sure,
        // but mermaid.render usually respects the current config.
        // To be safe against previous dark mode inits, we can try to re-init here if needed,
        // but usually top-level is best.

        const uniqueId = `mermaid-${id}-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, chart);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError('Failed to render diagram');
      }
    };

    if (chart) {
      renderDiagram();
    }
  }, [chart, id]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (error) return <div className="text-red-500 p-4 border border-red-500 rounded">{error}</div>;

  return (
    <>
      <div
        className="mermaid-wrapper overflow-x-auto flex justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm cursor-pointer hover-scale relative group"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 p-1 rounded text-slate-500">
          <Maximize2 size={16} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      </div>

      {isModalOpen && createPortal(
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Diagram Viewer</h3>
              <button className="zoom-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit={true}
                wheel={{ step: 0.1 }}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <div className="zoom-controls">
                      <button onClick={() => zoomIn()} className="zoom-btn" title="Zoom In">
                        <ZoomIn size={20} />
                      </button>
                      <button onClick={() => zoomOut()} className="zoom-btn" title="Zoom Out">
                        <ZoomOut size={20} />
                      </button>
                      <button onClick={() => resetTransform()} className="zoom-btn" title="Reset">
                        <RotateCcw size={20} />
                      </button>
                    </div>
                    <TransformComponent
                      wrapperStyle={{ width: '100%', height: '100%' }}
                      contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: svg
                            .replace(/max-width:[^;"]+;?/g, '')
                            .replace(/height:[^;"]+;?/g, '')
                            .replace(/<svg /, '<svg width="100%" height="100%" ')
                        }}
                        style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      />
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              Use mouse wheel to zoom, click and drag to pan.
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default MermaidDiagram;
