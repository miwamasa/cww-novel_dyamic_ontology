import React from 'react';
import './OperationPanel.css';

function OperationPanel({ operations, selectedOperation, onOperationChange, onViewPrompt, onExecute, loading, loadingPrompt }) {
  const operationSymbols = {
    addition: '⊕',
    subtraction: '∖',
    merge: '∪',
    composition: '∘',
    division: '÷',
    transformation: '→'
  };

  return (
    <div className="operation-panel">
      <h3>Operation</h3>

      <div className="operation-selector">
        {operations.map((op) => (
          <button
            key={op.id}
            className={`operation-btn ${selectedOperation === op.id ? 'active' : ''}`}
            onClick={() => onOperationChange(op.id)}
            title={op.description}
          >
            <span className="operation-symbol">{operationSymbols[op.id] || '?'}</span>
            <span className="operation-name">{op.name}</span>
          </button>
        ))}
      </div>

      <div className="operation-description">
        {operations.find(op => op.id === selectedOperation)?.description || 'Select an operation'}
      </div>

      <div className="operation-buttons">
        <button
          className="view-prompt-btn"
          onClick={onViewPrompt}
          disabled={loadingPrompt || loading}
        >
          {loadingPrompt ? (
            <>
              <span className="spinner"></span>
              Loading...
            </>
          ) : (
            <>
              📋 View Prompt
            </>
          )}
        </button>

        <button
          className="execute-btn"
          onClick={onExecute}
          disabled={loading || loadingPrompt}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Executing...
            </>
          ) : (
            <>
              ▶ Execute Operation
            </>
          )}
        </button>
      </div>

      <div className="operation-info">
        <h4>Theory</h4>
        <div className="theory-content">
          {selectedOperation === 'addition' && (
            <div>
              <p><strong>Mathematical:</strong> O_result = O_A ⊕ O_B</p>
              <p>Disjoint union of two ontologies without alignment</p>
            </div>
          )}
          {selectedOperation === 'subtraction' && (
            <div>
              <p><strong>Mathematical:</strong> O_result = O_A ∖ O_B</p>
              <p>Remove components of B from A</p>
            </div>
          )}
          {selectedOperation === 'merge' && (
            <div>
              <p><strong>Mathematical:</strong> Pushout with alignment</p>
              <p>Identify semantic correspondences and merge intelligently</p>
            </div>
          )}
          {selectedOperation === 'composition' && (
            <div>
              <p><strong>Mathematical:</strong> O_A ∘ O_B via interface I</p>
              <p>Connect ontologies through shared interface</p>
            </div>
          )}
          {selectedOperation === 'division' && (
            <div>
              <p><strong>Mathematical:</strong> Given O_full and O_A, find O_B</p>
              <p>Inverse problem: reconstruct missing component</p>
            </div>
          )}
          {selectedOperation === 'transformation' && (
            <div>
              <p><strong>Mathematical:</strong> F: O_source → O_target (Functor)</p>
              <p>Structure-preserving transformation from one domain to another</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OperationPanel;
