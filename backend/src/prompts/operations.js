/**
 * LLM Prompts for Dynamic Ontology Operations
 *
 * Based on the theoretical framework:
 * - Addition (sum): Simple union of ontologies
 * - Subtraction: Removal of ontology components
 * - Merge: Union with alignment and conflict resolution
 * - Composition: Connecting ontologies via interfaces
 * - Division: Inverse problem - reconstructing missing parts
 */

export const OPERATION_PROMPTS = {
  /**
   * Addition/Sum Operation
   * Mathematical: O_result = O_A ⊕ O_B (disjoint union)
   */
  addition: {
    name: 'Addition (Sum)',
    description: 'Simple union of two ontologies without considering alignments',
    template: (ontologyA, ontologyB) => `
# Task: Ontology Addition (Disjoint Union)

You are performing a SIMPLE ADDITION (disjoint union) of two ontologies.
This operation creates a union WITHOUT trying to align or merge similar concepts.
All classes, relations, and instances from both ontologies are preserved as separate entities.

## Input Ontology A:
${JSON.stringify(ontologyA, null, 2)}

## Input Ontology B:
${JSON.stringify(ontologyB, null, 2)}

## Instructions:
1. Combine all classes from both ontologies (keep them separate even if names are similar)
2. Combine all relations from both ontologies
3. Combine all axioms from both ontologies
4. Combine all instances from both ontologies
5. Prefix class/relation IDs to avoid collisions (e.g., A_Person, B_Human)
6. Note any potential name conflicts but DO NOT merge them

## Output Format (JSON):
{
  "result": {
    "id": "combined-ontology-id",
    "name": "A + B",
    "classes": [...],
    "relations": [...],
    "axioms": [...],
    "instances": [...],
    "vocabulary": {...}
  },
  "metadata": {
    "operation": "addition",
    "sourceOntologies": ["A", "B"],
    "conflicts": ["list of potential name conflicts"],
    "statistics": {
      "totalClasses": number,
      "totalRelations": number,
      "totalInstances": number
    }
  }
}

Generate the complete result following this schema.
`
  },

  /**
   * Subtraction Operation
   * Mathematical: O_result = O_A \ O_B (set difference)
   */
  subtraction: {
    name: 'Subtraction (Difference)',
    description: 'Remove components of ontology B from ontology A',
    template: (ontologyA, ontologyB) => `
# Task: Ontology Subtraction (Set Difference)

You are performing SUBTRACTION: removing all elements of Ontology B from Ontology A.
This operation removes classes, relations, axioms, and instances that appear in B from A.

## Input Ontology A (base):
${JSON.stringify(ontologyA, null, 2)}

## Input Ontology B (to remove):
${JSON.stringify(ontologyB, null, 2)}

## Instructions:
1. Identify matching elements between A and B (by ID or semantic similarity)
2. Remove from A:
   - Classes that match B's classes
   - Relations that match B's relations
   - Axioms that reference removed classes/relations
   - Instances of removed classes
3. Ensure referential integrity (remove dangling references)
4. Document what was removed and why

## Output Format (JSON):
{
  "result": {
    "id": "subtracted-ontology-id",
    "name": "A - B",
    "classes": [...],
    "relations": [...],
    "axioms": [...],
    "instances": [...],
    "vocabulary": {...}
  },
  "metadata": {
    "operation": "subtraction",
    "removed": {
      "classes": ["list of removed class IDs"],
      "relations": ["list of removed relation IDs"],
      "instances": ["list of removed instance IDs"]
    },
    "reasoning": ["explanations for each removal"]
  }
}

Generate the complete result following this schema.
`
  },

  /**
   * Merge Operation
   * Mathematical: Pushout with alignment
   */
  merge: {
    name: 'Merge (Alignment-based Union)',
    description: 'Merge two ontologies by identifying alignments and resolving conflicts',
    template: (ontologyA, ontologyB) => `
# Task: Ontology Merge (Alignment-based Union)

You are performing an INTELLIGENT MERGE of two ontologies.
This operation identifies semantic correspondences (alignments) between concepts and merges them appropriately.

## Input Ontology A:
${JSON.stringify(ontologyA, null, 2)}

## Input Ontology B:
${JSON.stringify(ontologyB, null, 2)}

## Instructions:
1. **Alignment Phase**: Identify correspondences between A and B
   - Find semantically equivalent classes (e.g., Person ≡ Human)
   - Find equivalent relations (e.g., hasName ≡ name)
   - Assign confidence scores (0.0 to 1.0)

2. **Merge Phase**: For each alignment with confidence > 0.8:
   - Unify the concepts under a single ID
   - Merge their properties and constraints
   - Resolve conflicts (e.g., different cardinalities)

3. **Conflict Resolution**: For contradictions:
   - List all detected conflicts
   - Propose 2-3 resolution strategies for each
   - Select the most reasonable one

4. **Integration**: Add non-aligned elements from both ontologies

## Output Format (JSON):
{
  "result": {
    "id": "merged-ontology-id",
    "name": "A ∪ B (merged)",
    "classes": [...],
    "relations": [...],
    "axioms": [...],
    "instances": [...],
    "vocabulary": {...}
  },
  "alignments": [
    {
      "sourceA": "class/relation ID from A",
      "sourceB": "class/relation ID from B",
      "confidence": 0.95,
      "reasoning": "explanation"
    }
  ],
  "conflicts": [
    {
      "description": "conflict description",
      "resolutionStrategies": ["strategy 1", "strategy 2"],
      "selectedStrategy": "strategy 1",
      "reasoning": "why this was chosen"
    }
  ],
  "metadata": {
    "operation": "merge",
    "alignmentCount": number,
    "conflictCount": number
  }
}

Generate the complete result following this schema.
`
  },

  /**
   * Composition Operation
   * Mathematical: Pushout along interface
   */
  composition: {
    name: 'Composition (Interface-based Connection)',
    description: 'Compose two ontologies by connecting through a shared interface',
    template: (ontologyA, ontologyB, interfaceSpec) => `
# Task: Ontology Composition (Interface-based)

You are performing COMPOSITION: connecting two ontologies through a shared interface.
Ontology A's output types should match Ontology B's input types through the interface.

## Input Ontology A:
${JSON.stringify(ontologyA, null, 2)}

## Input Ontology B:
${JSON.stringify(ontologyB, null, 2)}

## Interface Specification:
${JSON.stringify(interfaceSpec || { description: 'Auto-detect compatible interfaces' }, null, 2)}

## Instructions:
1. **Interface Detection**: Identify compatible connection points
   - Output classes/relations from A that can feed into B
   - Input classes/relations in B that can receive from A
   - Example: A's "ProductionBatch" → B's "EmissionEntry.sourceFor"

2. **Connection**: Create linking relations
   - Add relations that connect A's outputs to B's inputs
   - Ensure type compatibility

3. **Composition**: Build the composed ontology
   - Include all elements from A and B
   - Add interface relations
   - Propagate constraints

## Output Format (JSON):
{
  "result": {
    "id": "composed-ontology-id",
    "name": "A ∘ B (composed)",
    "classes": [...],
    "relations": [...],
    "axioms": [...],
    "instances": [...],
    "vocabulary": {...}
  },
  "interface": {
    "connections": [
      {
        "fromA": "class/relation ID",
        "toB": "class/relation ID",
        "linkRelation": "new relation connecting them",
        "reasoning": "explanation"
      }
    ]
  },
  "metadata": {
    "operation": "composition",
    "connectionCount": number
  }
}

Generate the complete result following this schema.
`
  },

  /**
   * Division Operation (Inverse Problem)
   * Mathematical: Given O_full and O_known, find O_unknown such that O_full ≈ O_known ⊕ O_unknown
   */
  division: {
    name: 'Division (Inverse/Decomposition)',
    description: 'Given a merged ontology and one component, reconstruct the missing component',
    template: (ontologyFull, ontologyKnown) => `
# Task: Ontology Division (Inverse Problem)

You are performing DIVISION: reconstructing a missing ontology component.
Given the full (merged) ontology and one known component, infer what the unknown component should be.

## Input: Full Ontology (merged result):
${JSON.stringify(ontologyFull, null, 2)}

## Input: Known Component:
${JSON.stringify(ontologyKnown, null, 2)}

## Instructions:
1. **Difference Analysis**: Identify elements in Full that are NOT in Known
   - Classes unique to Full
   - Relations unique to Full
   - Instances and axioms not explained by Known

2. **Pattern Inference**: Look for coherent patterns in the difference
   - Group related classes/relations
   - Identify the conceptual domain of the missing component

3. **Reconstruction**: Build the most plausible unknown component
   - Apply Occam's razor (simplest explanation)
   - Ensure it's coherent and self-contained
   - When composed with Known, it should approximate Full

4. **Validation**: Check that Known + Unknown ≈ Full

## Output Format (JSON):
{
  "result": {
    "id": "reconstructed-ontology-id",
    "name": "Unknown component (O_B)",
    "classes": [...],
    "relations": [...],
    "axioms": [...],
    "instances": [...],
    "vocabulary": {...}
  },
  "analysis": {
    "uniqueToFull": {
      "classes": ["IDs"],
      "relations": ["IDs"],
      "instances": ["IDs"]
    },
    "inferredDomain": "description of what the unknown component represents",
    "certainty": "high/medium/low"
  },
  "validation": {
    "compositionCheck": "whether Known + Unknown ≈ Full",
    "discrepancies": ["any elements that don't fit perfectly"]
  },
  "metadata": {
    "operation": "division",
    "alternativeSolutions": ["descriptions of other possible reconstructions"]
  }
}

Generate the complete result following this schema.
`
  },

  /**
   * Transformation Operation
   * Mathematical: F: O_source → O_target (Functor mapping)
   */
  transformation: {
    name: 'Transformation (Domain Mapping)',
    description: 'Transform source ontology to target schema using explicit mappings',
    template: (ontologyA, ontologyB, mappingRules) => `
# Task: Ontology Transformation (Functor Mapping)

You are performing an ONTOLOGY TRANSFORMATION.
This operation transforms a source ontology into a target ontology structure using explicit mapping rules.
This is a STRUCTURE-PRESERVING transformation (functor) that converts data from one domain to another.

## Source Ontology (to be transformed):
${JSON.stringify(ontologyA, null, 2)}

## Target Schema/Ontology (target structure):
${JSON.stringify(ontologyB, null, 2)}

## Transformation Mapping Rules:
${mappingRules ? JSON.stringify(mappingRules, null, 2) : `
INFER mapping rules by:
1. Finding semantic correspondences between source and target classes
2. Mapping relations based on domain/range compatibility
3. Identifying computed properties (e.g., emissions = activity × factor)
4. Preserving traceability to source data
`}

## Instructions:

### 1. Class Transformation
- For each class in source ontology, find corresponding class in target schema
- Create mapping: SourceClass → TargetClass
- Document confidence level for each mapping

### 2. Relation Transformation
- Map source relations to target relations
- Handle type conversions if needed
- Identify relations that need computation (derived properties)

### 3. Instance Transformation (Data Migration)
- For each instance in source:
  * Apply class mapping to determine target class
  * Apply relation mappings to transform properties
  * Compute derived properties using formulas
  * Preserve traceability (reference to original instance)

### 4. Computed Properties
- Identify properties that don't exist in source but are required in target
- Define computation rules (e.g., from metadata or external data)
- Apply computations to all transformed instances

### 5. Quality Assurance
- Verify all required target properties are populated
- Check data type compatibility
- Ensure no data loss (preserve unmapped data in metadata)
- Validate against target schema

## Output Format (JSON):
{
  "result": {
    "id": "transformed-ontology-id",
    "name": "Target Ontology Name (Transformed from Source)",
    "version": "1.0",
    "classes": [...],  // Target schema classes
    "relations": [...],  // Target schema relations
    "axioms": [...],
    "instances": [...],  // Transformed instances
    "vocabulary": {...},
    "metadata": {
      "transformation": {
        "source_ontology": "source-id",
        "target_schema": "target-id",
        "transformation_date": "ISO datetime",
        "total_emissions": "if applicable"
      }
    }
  },
  "transformation_metadata": {
    "operation": "transformation",
    "mappings_applied": [
      {
        "source": "SourceClass",
        "target": "TargetClass",
        "type": "class",
        "confidence": 0.95
      },
      {
        "source": "sourceRelation",
        "target": "targetRelation",
        "type": "relation",
        "transformation": "direct|computed|derived"
      }
    ],
    "computed_properties": [
      {
        "property": "propertyName",
        "formula": "description of computation",
        "source": "metadata|external_db|calculation"
      }
    ],
    "unmapped_elements": [
      {
        "element": "ElementName",
        "type": "class|relation",
        "reason": "no corresponding element in target schema",
        "preserved_in": "metadata"
      }
    ],
    "data_quality": {
      "instances_transformed": number,
      "completeness": "percentage",
      "data_loss": false,
      "validation_status": "passed|failed"
    }
  }
}

## Example: Factory Production → GHG Reporting

If transforming production data to GHG report:
- ProductionBatch → EmissionEntry
- quantity → activity
- Compute: emissionFactor (from product metadata or external DB)
- Compute: emissions = activity × emissionFactor
- Preserve: original batch ID in sourceFor

Generate the complete result following this schema.
`
  }
};

/**
 * Generate a prompt for a specific operation
 * @param {string} operation - One of: 'addition', 'subtraction', 'merge', 'composition', 'division', 'transformation'
 * @param {Object} params - Operation parameters (ontologies, interface spec, mapping rules, etc.)
 * @returns {string} The complete prompt
 */
export function generatePrompt(operation, params) {
  const promptConfig = OPERATION_PROMPTS[operation];
  if (!promptConfig) {
    throw new Error(`Unknown operation: ${operation}`);
  }

  switch (operation) {
    case 'addition':
    case 'subtraction':
    case 'merge':
    case 'division':
      return promptConfig.template(params.ontologyA, params.ontologyB);
    case 'composition':
      return promptConfig.template(params.ontologyA, params.ontologyB, params.interface);
    case 'transformation':
      return promptConfig.template(params.ontologyA, params.ontologyB, params.mappingRules);
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

/**
 * Get list of available operations
 * @returns {Array} List of operation metadata
 */
export function getOperations() {
  return Object.entries(OPERATION_PROMPTS).map(([key, config]) => ({
    id: key,
    name: config.name,
    description: config.description
  }));
}
