/**
 * Ontology API Routes
 */

import express from 'express';
import { OntologyService } from '../services/ontologyService.js';
import { createLLMService } from '../services/llmService.js';
import { generatePrompt, getOperations } from '../prompts/operations.js';

const router = express.Router();

/**
 * GET /api/operations
 * List available ontology operations
 */
router.get('/operations', (req, res) => {
  const operations = getOperations();
  res.json({ operations });
});

/**
 * POST /api/validate
 * Validate an ontology structure
 */
router.post('/validate', (req, res) => {
  try {
    const { ontology } = req.body;
    const result = OntologyService.validate(ontology);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/convert/to-turtle
 * Convert ontology to Turtle format
 */
router.post('/convert/to-turtle', (req, res) => {
  try {
    const { ontology } = req.body;
    const turtle = OntologyService.toTurtle(ontology);
    res.json({ turtle });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/execute/:operation
 * Execute an ontology operation using LLM
 *
 * Operations: addition, subtraction, merge, composition, division
 */
router.post('/execute/:operation', async (req, res) => {
  try {
    const { operation } = req.params;
    const { ontologyA, ontologyB, interface: interfaceSpec, options = {} } = req.body;

    // Validate inputs
    if (!ontologyA) {
      return res.status(400).json({ error: 'ontologyA is required' });
    }

    const validOperations = ['addition', 'subtraction', 'merge', 'composition', 'division'];
    if (!validOperations.includes(operation)) {
      return res.status(400).json({
        error: `Invalid operation: ${operation}`,
        validOperations
      });
    }

    // For operations that require two ontologies
    if (['addition', 'subtraction', 'merge', 'composition', 'division'].includes(operation)) {
      if (!ontologyB) {
        return res.status(400).json({ error: 'ontologyB is required for this operation' });
      }
    }

    // Generate prompt
    const prompt = generatePrompt(operation, {
      ontologyA,
      ontologyB,
      interface: interfaceSpec
    });

    // Execute with LLM
    const llmService = createLLMService(options.llm);
    const result = await llmService.execute(prompt, {
      temperature: options.temperature,
      maxTokens: options.maxTokens
    });

    // Validate result if present
    if (result.result) {
      const validation = OntologyService.validate(result.result);
      if (!validation.valid) {
        console.warn('LLM produced invalid ontology:', validation.errors);
        result.validation = validation;
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Operation execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/generate-prompt/:operation
 * Generate LLM prompt without executing
 */
router.post('/generate-prompt/:operation', (req, res) => {
  try {
    const { operation } = req.params;
    const { ontologyA, ontologyB, interface: interfaceSpec } = req.body;

    // Validate inputs
    if (!ontologyA) {
      return res.status(400).json({ error: 'ontologyA is required' });
    }

    const validOperations = ['addition', 'subtraction', 'merge', 'composition', 'division'];
    if (!validOperations.includes(operation)) {
      return res.status(400).json({
        error: `Invalid operation: ${operation}`,
        validOperations
      });
    }

    // Generate prompt
    const prompt = generatePrompt(operation, {
      ontologyA,
      ontologyB,
      interface: interfaceSpec
    });

    res.json({
      operation,
      prompt,
      inputSummary: {
        ontologyA: {
          id: ontologyA.id,
          name: ontologyA.name,
          classCount: ontologyA.classes?.length || 0,
          relationCount: ontologyA.relations?.length || 0
        },
        ontologyB: ontologyB ? {
          id: ontologyB.id,
          name: ontologyB.name,
          classCount: ontologyB.classes?.length || 0,
          relationCount: ontologyB.relations?.length || 0
        } : null
      }
    });
  } catch (error) {
    console.error('Prompt generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/test-llm
 * Test LLM connection
 */
router.post('/test-llm', async (req, res) => {
  try {
    const { options = {} } = req.body;
    const llmService = createLLMService(options.llm);
    const connected = await llmService.testConnection();

    res.json({
      connected,
      provider: llmService.provider,
      model: llmService.model,
      hasApiKey: !!llmService.apiKey
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/examples
 * Get example ontologies
 */
router.get('/examples', (req, res) => {
  const examples = {
    person: {
      id: 'person-ontology',
      name: 'Person Ontology',
      version: '1.0',
      metadata: {
        description: 'Simple ontology for person information'
      },
      classes: [
        {
          id: 'Person',
          name: 'Person',
          superClasses: [],
          metadata: { description: 'A human being' }
        },
        {
          id: 'Employee',
          name: 'Employee',
          superClasses: ['Person'],
          metadata: { description: 'A person employed by an organization' }
        },
        {
          id: 'Address',
          name: 'Address',
          superClasses: [],
          metadata: { description: 'Physical address' }
        }
      ],
      relations: [
        {
          id: 'hasName',
          name: 'has name',
          domain: 'Person',
          range: 'xsd:string',
          type: 'datatype',
          constraints: { functional: true },
          metadata: {}
        },
        {
          id: 'hasAddress',
          name: 'has address',
          domain: 'Person',
          range: 'Address',
          type: 'object',
          constraints: {},
          metadata: {}
        },
        {
          id: 'worksAt',
          name: 'works at',
          domain: 'Employee',
          range: 'xsd:string',
          type: 'datatype',
          constraints: {},
          metadata: {}
        }
      ],
      axioms: [
        {
          id: 'employee-subclass',
          type: 'subClassOf',
          statement: { subClass: 'Employee', superClass: 'Person' },
          description: 'Employee is a subclass of Person'
        }
      ],
      instances: [
        {
          id: 'john',
          classId: 'Employee',
          properties: {
            hasName: 'John Doe',
            worksAt: 'Acme Corp'
          },
          metadata: {}
        }
      ],
      vocabulary: {}
    },
    factory: {
      id: 'factory-production',
      name: 'Factory Production',
      version: '1.0',
      metadata: {
        description: 'Ontology for factory production tracking'
      },
      classes: [
        {
          id: 'Factory',
          name: 'Factory',
          superClasses: [],
          metadata: {}
        },
        {
          id: 'ProductionBatch',
          name: 'Production Batch',
          superClasses: [],
          metadata: {}
        },
        {
          id: 'Product',
          name: 'Product',
          superClasses: [],
          metadata: {}
        }
      ],
      relations: [
        {
          id: 'produces',
          name: 'produces',
          domain: 'Factory',
          range: 'ProductionBatch',
          type: 'object',
          constraints: {},
          metadata: {}
        },
        {
          id: 'batchOf',
          name: 'batch of',
          domain: 'ProductionBatch',
          range: 'Product',
          type: 'object',
          constraints: {},
          metadata: {}
        },
        {
          id: 'quantity',
          name: 'quantity',
          domain: 'ProductionBatch',
          range: 'xsd:decimal',
          type: 'datatype',
          constraints: {},
          metadata: {}
        },
        {
          id: 'timestamp',
          name: 'timestamp',
          domain: 'ProductionBatch',
          range: 'xsd:dateTime',
          type: 'datatype',
          constraints: {},
          metadata: {}
        }
      ],
      axioms: [],
      instances: [
        {
          id: 'F1',
          classId: 'Factory',
          properties: {},
          metadata: { name: 'Factory 1' }
        },
        {
          id: 'Batch_2025_11_01',
          classId: 'ProductionBatch',
          properties: {
            batchOf: ':WidgetX',
            quantity: { value: '1000', type: 'xsd:decimal' },
            timestamp: { value: '2025-11-01T08:00:00', type: 'xsd:dateTime' }
          },
          metadata: {}
        },
        {
          id: 'WidgetX',
          classId: 'Product',
          properties: {},
          metadata: { name: 'Widget X' }
        }
      ],
      vocabulary: {}
    },
    ghg: {
      id: 'ghg-report',
      name: 'GHG Report',
      version: '1.0',
      metadata: {
        description: 'Ontology for GHG emission reporting'
      },
      classes: [
        {
          id: 'EmissionReport',
          name: 'Emission Report',
          superClasses: [],
          metadata: {}
        },
        {
          id: 'EmissionEntry',
          name: 'Emission Entry',
          superClasses: [],
          metadata: {}
        },
        {
          id: 'EmissionSource',
          name: 'Emission Source',
          superClasses: [],
          metadata: {}
        }
      ],
      relations: [
        {
          id: 'hasSource',
          name: 'has source',
          domain: 'EmissionReport',
          range: 'EmissionEntry',
          type: 'object',
          constraints: {},
          metadata: {}
        },
        {
          id: 'sourceFor',
          name: 'source for',
          domain: 'EmissionEntry',
          range: 'xsd:string',
          type: 'datatype',
          constraints: {},
          metadata: { description: 'Reference to production batch' }
        },
        {
          id: 'activity',
          name: 'activity',
          domain: 'EmissionEntry',
          range: 'xsd:decimal',
          type: 'datatype',
          constraints: {},
          metadata: { description: 'Activity amount (e.g., production quantity)' }
        },
        {
          id: 'emissionFactor',
          name: 'emission factor',
          domain: 'EmissionEntry',
          range: 'xsd:decimal',
          type: 'datatype',
          constraints: {},
          metadata: { description: 'Emission factor (e.g., kgCO2e per unit)' }
        },
        {
          id: 'emissions',
          name: 'emissions',
          domain: 'EmissionEntry',
          range: 'xsd:decimal',
          type: 'datatype',
          constraints: {},
          metadata: { description: 'Calculated emissions (kgCO2e)' }
        }
      ],
      axioms: [],
      instances: [
        {
          id: 'Entry_1',
          classId: 'EmissionEntry',
          properties: {
            sourceFor: 'Batch_2025_11_01',
            activity: { value: '1000', type: 'xsd:decimal' },
            emissionFactor: { value: '0.75', type: 'xsd:decimal' },
            emissions: { value: '750', type: 'xsd:decimal' }
          },
          metadata: {}
        }
      ],
      vocabulary: {}
    }
  };

  res.json({ examples });
});

export default router;
