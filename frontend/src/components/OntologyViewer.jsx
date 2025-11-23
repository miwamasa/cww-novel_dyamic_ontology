import React, { useState } from 'react';
import './OntologyViewer.css';

function OntologyViewer({ ontology, onChange }) {
  const [showJson, setShowJson] = useState(false);

  if (!ontology) {
    return (
      <div className="ontology-viewer empty">
        <p>No ontology loaded</p>
        <p className="hint">Select an example or create a new ontology</p>
      </div>
    );
  }

  const handleJsonEdit = (e) => {
    try {
      const parsed = JSON.parse(e.target.value);
      onChange(parsed);
    } catch (err) {
      // Invalid JSON, don't update
    }
  };

  return (
    <div className="ontology-viewer">
      <div className="viewer-header">
        <h4>{ontology.name}</h4>
        <button
          className="toggle-view-btn"
          onClick={() => setShowJson(!showJson)}
        >
          {showJson ? 'Tree View' : 'JSON View'}
        </button>
      </div>

      {showJson ? (
        <textarea
          className="json-editor"
          value={JSON.stringify(ontology, null, 2)}
          onChange={handleJsonEdit}
          spellCheck={false}
        />
      ) : (
        <div className="tree-view">
          <div className="ontology-section">
            <h5>Classes ({ontology.classes?.length || 0})</h5>
            <ul className="class-list">
              {ontology.classes?.map((cls) => (
                <li key={cls.id} className="class-item">
                  <span className="class-name">{cls.name || cls.id}</span>
                  {cls.superClasses && cls.superClasses.length > 0 && (
                    <span className="super-classes">
                      ⊑ {cls.superClasses.join(', ')}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="ontology-section">
            <h5>Relations ({ontology.relations?.length || 0})</h5>
            <ul className="relation-list">
              {ontology.relations?.map((rel) => (
                <li key={rel.id} className="relation-item">
                  <span className="relation-name">{rel.name || rel.id}</span>
                  <span className="relation-signature">
                    : {rel.domain} → {rel.range}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {ontology.instances && ontology.instances.length > 0 && (
            <div className="ontology-section">
              <h5>Instances ({ontology.instances.length})</h5>
              <ul className="instance-list">
                {ontology.instances.map((inst) => (
                  <li key={inst.id} className="instance-item">
                    <span className="instance-name">{inst.id}</span>
                    <span className="instance-type">: {inst.classId}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ontology.axioms && ontology.axioms.length > 0 && (
            <div className="ontology-section">
              <h5>Axioms ({ontology.axioms.length})</h5>
              <ul className="axiom-list">
                {ontology.axioms.map((axiom, idx) => (
                  <li key={axiom.id || idx} className="axiom-item">
                    {axiom.description || axiom.type}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OntologyViewer;
