import React, { useState, useEffect } from 'react';
import OntologyViewer from './components/OntologyViewer';
import OperationPanel from './components/OperationPanel';
import ResultDisplay from './components/ResultDisplay';
import './App.css';

function App() {
  const [examples, setExamples] = useState(null);
  const [ontologyA, setOntologyA] = useState(null);
  const [ontologyB, setOntologyB] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState('merge');
  const [operations, setOperations] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [llmStatus, setLlmStatus] = useState(null);

  // Load examples and operations on mount
  useEffect(() => {
    loadExamples();
    loadOperations();
    testLLMConnection();
  }, []);

  const loadExamples = async () => {
    try {
      const response = await fetch('/api/examples');
      const data = await response.json();
      setExamples(data.examples);
    } catch (err) {
      console.error('Failed to load examples:', err);
    }
  };

  const loadOperations = async () => {
    try {
      const response = await fetch('/api/operations');
      const data = await response.json();
      setOperations(data.operations);
    } catch (err) {
      console.error('Failed to load operations:', err);
    }
  };

  const testLLMConnection = async () => {
    try {
      const response = await fetch('/api/test-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      setLlmStatus(data);
    } catch (err) {
      console.error('Failed to test LLM connection:', err);
    }
  };

  const loadExample = (exampleKey) => {
    if (!examples) return;

    switch (exampleKey) {
      case 'person-human':
        // Person vs Human example (from theory)
        setOntologyA({
          id: 'person-employee',
          name: 'Person/Employee Ontology',
          version: '1.0',
          metadata: {},
          classes: [
            { id: 'Person', name: 'Person', superClasses: [], metadata: {} },
            { id: 'Employee', name: 'Employee', superClasses: ['Person'], metadata: {} },
            { id: 'Address', name: 'Address', superClasses: [], metadata: {} }
          ],
          relations: [
            { id: 'hasName', name: 'has name', domain: 'Person', range: 'xsd:string', type: 'datatype', constraints: {}, metadata: {} },
            { id: 'hasAddress', name: 'has address', domain: 'Person', range: 'Address', type: 'object', constraints: {}, metadata: {} },
            { id: 'worksAt', name: 'works at', domain: 'Employee', range: 'xsd:string', type: 'datatype', constraints: {}, metadata: {} }
          ],
          axioms: [],
          instances: [],
          vocabulary: {}
        });
        setOntologyB({
          id: 'human-worker',
          name: 'Human/Worker Ontology',
          version: '1.0',
          metadata: {},
          classes: [
            { id: 'Human', name: 'Human', superClasses: [], metadata: {} },
            { id: 'Worker', name: 'Worker', superClasses: ['Human'], metadata: {} },
            { id: 'Location', name: 'Location', superClasses: [], metadata: {} }
          ],
          relations: [
            { id: 'name', name: 'name', domain: 'Human', range: 'xsd:string', type: 'datatype', constraints: {}, metadata: {} },
            { id: 'residesIn', name: 'resides in', domain: 'Human', range: 'Location', type: 'object', constraints: {}, metadata: {} },
            { id: 'employedBy', name: 'employed by', domain: 'Worker', range: 'xsd:string', type: 'datatype', constraints: {}, metadata: {} }
          ],
          axioms: [],
          instances: [],
          vocabulary: {}
        });
        break;
      case 'factory-ghg':
        setOntologyA(examples.factory);
        setOntologyB(examples.ghg);
        break;
      default:
        break;
    }
  };

  const executeOperation = async () => {
    if (!ontologyA || !ontologyB) {
      setError('Please select or define both ontologies');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/execute/${selectedOperation}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ontologyA,
          ontologyB,
          options: {}
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Operation failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Dynamic Ontology Operations</h1>
        <p>形式的なDynamic Ontologyの実証システム</p>
        {llmStatus && (
          <div className={`llm-status ${llmStatus.hasApiKey ? 'connected' : 'mock'}`}>
            {llmStatus.hasApiKey
              ? `🟢 LLM: ${llmStatus.provider} (${llmStatus.model})`
              : '⚠️ Mock Mode (No API Key)'
            }
          </div>
        )}
      </header>

      <div className="app-content">
        <section className="examples-section">
          <h2>Examples</h2>
          <div className="example-buttons">
            <button onClick={() => loadExample('person-human')}>
              Person/Employee vs Human/Worker
            </button>
            <button onClick={() => loadExample('factory-ghg')}>
              Factory Production + GHG Report
            </button>
          </div>
        </section>

        <div className="ontology-panels">
          <div className="ontology-panel">
            <h3>Ontology A</h3>
            <OntologyViewer
              ontology={ontologyA}
              onChange={setOntologyA}
            />
          </div>

          <div className="operation-panel-container">
            <OperationPanel
              operations={operations}
              selectedOperation={selectedOperation}
              onOperationChange={setSelectedOperation}
              onExecute={executeOperation}
              loading={loading}
            />
          </div>

          <div className="ontology-panel">
            <h3>Ontology B</h3>
            <OntologyViewer
              ontology={ontologyB}
              onChange={setOntologyB}
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <ResultDisplay result={result} operation={selectedOperation} />
        )}
      </div>

      <footer className="app-footer">
        <p>Based on the theory of Dynamic Ontology with operations: Addition, Subtraction, Merge, Composition, Division</p>
      </footer>
    </div>
  );
}

export default App;
