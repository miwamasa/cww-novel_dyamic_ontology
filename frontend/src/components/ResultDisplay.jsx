import React, { useState } from 'react';
import './ResultDisplay.css';

function ResultDisplay({ result, operation }) {
  const [activeTab, setActiveTab] = useState('result');

  if (!result) return null;

  const renderResult = () => {
    if (!result.result) {
      return <pre>{JSON.stringify(result, null, 2)}</pre>;
    }

    const ontology = result.result;
    return (
      <div className="result-ontology">
        <div className="result-header">
          <h4>{ontology.name}</h4>
          <span className="result-id">{ontology.id}</span>
        </div>

        <div className="result-sections">
          <div className="result-section">
            <h5>Classes ({ontology.classes?.length || 0})</h5>
            <ul>
              {ontology.classes?.map((cls) => (
                <li key={cls.id}>
                  <strong>{cls.name || cls.id}</strong>
                  {cls.superClasses && cls.superClasses.length > 0 && (
                    <span className="super"> ⊑ {cls.superClasses.join(', ')}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="result-section">
            <h5>Relations ({ontology.relations?.length || 0})</h5>
            <ul>
              {ontology.relations?.map((rel) => (
                <li key={rel.id}>
                  <strong>{rel.name || rel.id}</strong>
                  <span className="signature">: {rel.domain} → {rel.range}</span>
                </li>
              ))}
            </ul>
          </div>

          {ontology.instances && ontology.instances.length > 0 && (
            <div className="result-section">
              <h5>Instances ({ontology.instances.length})</h5>
              <ul>
                {ontology.instances.map((inst) => (
                  <li key={inst.id}>
                    <strong>{inst.id}</strong>
                    <span className="type">: {inst.classId}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAlignments = () => {
    if (!result.alignments || result.alignments.length === 0) {
      return <p>No alignments detected</p>;
    }

    return (
      <div className="alignments-list">
        {result.alignments.map((alignment, idx) => (
          <div key={idx} className="alignment-item">
            <div className="alignment-mapping">
              <span className="source-a">{alignment.sourceA}</span>
              <span className="arrow">≡</span>
              <span className="source-b">{alignment.sourceB}</span>
              <span className="confidence">{(alignment.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="alignment-reasoning">{alignment.reasoning}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderConflicts = () => {
    if (!result.conflicts || result.conflicts.length === 0) {
      return <p className="no-conflicts">✓ No conflicts detected</p>;
    }

    return (
      <div className="conflicts-list">
        {result.conflicts.map((conflict, idx) => (
          <div key={idx} className="conflict-item">
            <div className="conflict-description">{conflict.description}</div>
            {conflict.resolutionStrategies && (
              <div className="conflict-strategies">
                <strong>Resolution strategies:</strong>
                <ul>
                  {conflict.resolutionStrategies.map((strategy, sidx) => (
                    <li key={sidx} className={conflict.selectedStrategy === strategy ? 'selected' : ''}>
                      {strategy}
                      {conflict.selectedStrategy === strategy && ' ✓'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {conflict.reasoning && (
              <div className="conflict-reasoning">
                <strong>Reasoning:</strong> {conflict.reasoning}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderMetadata = () => {
    const metadata = result.metadata || {};
    const analysis = result.analysis || {};
    const validation = result.validation || {};

    return (
      <div className="metadata-content">
        {Object.keys(metadata).length > 0 && (
          <div className="metadata-section">
            <h5>Metadata</h5>
            <pre>{JSON.stringify(metadata, null, 2)}</pre>
          </div>
        )}

        {Object.keys(analysis).length > 0 && (
          <div className="metadata-section">
            <h5>Analysis</h5>
            <pre>{JSON.stringify(analysis, null, 2)}</pre>
          </div>
        )}

        {Object.keys(validation).length > 0 && (
          <div className="metadata-section">
            <h5>Validation</h5>
            <pre>{JSON.stringify(validation, null, 2)}</pre>
          </div>
        )}

        {result.interface && (
          <div className="metadata-section">
            <h5>Interface Connections</h5>
            <pre>{JSON.stringify(result.interface, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="result-display">
      <div className="result-header-main">
        <h2>Result: {operation}</h2>
      </div>

      <div className="result-tabs">
        <button
          className={`tab-btn ${activeTab === 'result' ? 'active' : ''}`}
          onClick={() => setActiveTab('result')}
        >
          Ontology Result
        </button>
        {result.alignments && (
          <button
            className={`tab-btn ${activeTab === 'alignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('alignments')}
          >
            Alignments ({result.alignments.length})
          </button>
        )}
        {result.conflicts !== undefined && (
          <button
            className={`tab-btn ${activeTab === 'conflicts' ? 'active' : ''}`}
            onClick={() => setActiveTab('conflicts')}
          >
            Conflicts ({result.conflicts?.length || 0})
          </button>
        )}
        <button
          className={`tab-btn ${activeTab === 'metadata' ? 'active' : ''}`}
          onClick={() => setActiveTab('metadata')}
        >
          Metadata & Analysis
        </button>
        {result._meta && result._meta.rawResponse && (
          <button
            className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
            onClick={() => setActiveTab('raw')}
          >
            Raw LLM Response
          </button>
        )}
        <button
          className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}
          onClick={() => setActiveTab('json')}
        >
          Full JSON
        </button>
      </div>

      <div className="result-content">
        {activeTab === 'result' && renderResult()}
        {activeTab === 'alignments' && renderAlignments()}
        {activeTab === 'conflicts' && renderConflicts()}
        {activeTab === 'metadata' && renderMetadata()}
        {activeTab === 'raw' && result._meta && (
          <div className="raw-response-content">
            <div className="raw-response-info">
              <p><strong>Provider:</strong> {result._meta.provider}</p>
              <p><strong>Model:</strong> {result._meta.model}</p>
              <p><strong>Mock:</strong> {result._meta.mock ? 'Yes' : 'No'}</p>
            </div>
            <div className="raw-response-text">
              <h4>Raw Response from LLM:</h4>
              <pre className="json-output">{result._meta.rawResponse}</pre>
            </div>
          </div>
        )}
        {activeTab === 'json' && (
          <pre className="json-output">{JSON.stringify(result, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}

export default ResultDisplay;
