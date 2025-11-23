import React from 'react';
import './PromptModal.css';

function PromptModal({ isOpen, onClose, promptData }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>LLM Prompt Preview</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {promptData ? (
          <div className="modal-body">
            <div className="prompt-info">
              <div className="info-row">
                <strong>Operation:</strong> {promptData.operation}
              </div>
              {promptData.inputSummary && (
                <div className="input-summary">
                  <div className="summary-item">
                    <strong>Ontology A:</strong> {promptData.inputSummary.ontologyA.name}
                    <span className="stats">
                      ({promptData.inputSummary.ontologyA.classCount} classes,
                      {promptData.inputSummary.ontologyA.relationCount} relations)
                    </span>
                  </div>
                  {promptData.inputSummary.ontologyB && (
                    <div className="summary-item">
                      <strong>Ontology B:</strong> {promptData.inputSummary.ontologyB.name}
                      <span className="stats">
                        ({promptData.inputSummary.ontologyB.classCount} classes,
                        {promptData.inputSummary.ontologyB.relationCount} relations)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="prompt-content">
              <div className="prompt-header-label">
                <strong>Prompt to LLM:</strong>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(promptData.prompt);
                    alert('Prompt copied to clipboard!');
                  }}
                >
                  📋 Copy
                </button>
              </div>
              <pre className="prompt-text">{promptData.prompt}</pre>
            </div>
          </div>
        ) : (
          <div className="modal-body">
            <p>Loading prompt...</p>
          </div>
        )}

        <div className="modal-footer">
          <button className="close-footer-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PromptModal;
