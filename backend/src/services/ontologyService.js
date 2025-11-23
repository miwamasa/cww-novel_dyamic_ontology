/**
 * Dynamic Ontology Service
 *
 * Implements the formal dynamic ontology structure based on:
 * O = (C, R, A, I, Σ)
 * where:
 * - C: Classes/concepts
 * - R: Relations/properties
 * - A: Axioms/constraints
 * - I: Instance space
 * - Σ: Vocabulary/meta-information
 */

/**
 * Ontology structure definition
 * @typedef {Object} DynamicOntology
 * @property {string} id - Unique identifier
 * @property {string} name - Ontology name
 * @property {string} version - Version string
 * @property {Object} metadata - Additional metadata
 * @property {Class[]} classes - Set of classes (C)
 * @property {Relation[]} relations - Set of relations (R)
 * @property {Axiom[]} axioms - Set of axioms (A)
 * @property {Instance[]} instances - Instance space (I)
 * @property {Object} vocabulary - Vocabulary/meta-information (Σ)
 */

/**
 * @typedef {Object} Class
 * @property {string} id - Class identifier
 * @property {string} name - Human-readable name
 * @property {string[]} superClasses - Parent classes (for subClassOf)
 * @property {Object} metadata - Annotations, labels, etc.
 */

/**
 * @typedef {Object} Relation
 * @property {string} id - Relation identifier
 * @property {string} name - Human-readable name
 * @property {string} domain - Domain class ID
 * @property {string} range - Range class ID or data type
 * @property {string} type - 'object' or 'datatype'
 * @property {Object} constraints - Functional, inverse, etc.
 * @property {Object} metadata - Additional information
 */

/**
 * @typedef {Object} Axiom
 * @property {string} id - Axiom identifier
 * @property {string} type - 'subClassOf', 'equivalentClass', 'disjointWith', etc.
 * @property {Object} statement - The logical statement
 * @property {string} description - Human-readable description
 */

/**
 * @typedef {Object} Instance
 * @property {string} id - Instance identifier
 * @property {string} classId - Class this instance belongs to
 * @property {Object} properties - Property values {relationId: value}
 * @property {Object} metadata - Instance-specific metadata
 */

export class OntologyService {
  /**
   * Validate an ontology structure
   * @param {DynamicOntology} ontology
   * @returns {Object} {valid: boolean, errors: string[]}
   */
  static validate(ontology) {
    const errors = [];

    if (!ontology.id) errors.push('Ontology must have an id');
    if (!ontology.name) errors.push('Ontology must have a name');
    if (!Array.isArray(ontology.classes)) errors.push('classes must be an array');
    if (!Array.isArray(ontology.relations)) errors.push('relations must be an array');
    if (!Array.isArray(ontology.axioms)) errors.push('axioms must be an array');
    if (!Array.isArray(ontology.instances)) errors.push('instances must be an array');

    // Validate class references in relations
    if (ontology.relations && ontology.classes) {
      const classIds = new Set(ontology.classes.map(c => c.id));
      ontology.relations.forEach(rel => {
        if (rel.type === 'object' && rel.domain && !classIds.has(rel.domain)) {
          errors.push(`Relation ${rel.id} references unknown domain class ${rel.domain}`);
        }
        if (rel.type === 'object' && rel.range && !classIds.has(rel.range)) {
          // Range might be a datatype, so only error if it looks like a class reference
          if (!rel.range.startsWith('xsd:')) {
            errors.push(`Relation ${rel.id} references unknown range class ${rel.range}`);
          }
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert from RDF/Turtle-like structure to Dynamic Ontology format
   * @param {Object} rdfData - RDF-like data structure
   * @returns {DynamicOntology}
   */
  static fromRDF(rdfData) {
    // This would parse Turtle/JSON-LD and convert to our format
    // For now, return a template
    return {
      id: rdfData.id || 'generated-' + Date.now(),
      name: rdfData.name || 'Unnamed Ontology',
      version: '1.0',
      metadata: rdfData.metadata || {},
      classes: [],
      relations: [],
      axioms: [],
      instances: [],
      vocabulary: {}
    };
  }

  /**
   * Convert Dynamic Ontology to RDF/Turtle format
   * @param {DynamicOntology} ontology
   * @returns {string} Turtle format string
   */
  static toTurtle(ontology) {
    let turtle = `@prefix : <http://example.org/${ontology.id}#> .\n`;
    turtle += `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n`;
    turtle += `@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n\n`;
    turtle += `# Ontology: ${ontology.name}\n\n`;

    // Classes
    turtle += `# Classes\n`;
    ontology.classes.forEach(cls => {
      turtle += `:${cls.id} a rdfs:Class .\n`;
      if (cls.superClasses && cls.superClasses.length > 0) {
        cls.superClasses.forEach(parent => {
          turtle += `:${cls.id} rdfs:subClassOf :${parent} .\n`;
        });
      }
    });
    turtle += '\n';

    // Relations
    turtle += `# Relations\n`;
    ontology.relations.forEach(rel => {
      turtle += `:${rel.id} a rdf:Property ;\n`;
      if (rel.domain) {
        turtle += `  rdfs:domain :${rel.domain} ;\n`;
      }
      if (rel.range) {
        const rangePrefix = rel.range.startsWith('xsd:') ? '' : ':';
        turtle += `  rdfs:range ${rangePrefix}${rel.range} .\n`;
      }
    });
    turtle += '\n';

    // Instances
    turtle += `# Instances\n`;
    ontology.instances.forEach(inst => {
      turtle += `:${inst.id} a :${inst.classId} .\n`;
      if (inst.properties) {
        Object.entries(inst.properties).forEach(([propId, value]) => {
          if (typeof value === 'object' && value.type && value.value) {
            turtle += `:${inst.id} :${propId} "${value.value}"^^${value.type} .\n`;
          } else if (typeof value === 'string' && value.startsWith(':')) {
            turtle += `:${inst.id} :${propId} ${value} .\n`;
          } else {
            turtle += `:${inst.id} :${propId} "${value}" .\n`;
          }
        });
      }
    });

    return turtle;
  }

  /**
   * Create an empty ontology template
   * @param {string} id
   * @param {string} name
   * @returns {DynamicOntology}
   */
  static createEmpty(id, name) {
    return {
      id,
      name,
      version: '1.0',
      metadata: {
        created: new Date().toISOString(),
        description: ''
      },
      classes: [],
      relations: [],
      axioms: [],
      instances: [],
      vocabulary: {}
    };
  }
}
