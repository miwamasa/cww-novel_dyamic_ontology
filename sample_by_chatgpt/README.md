# Ontologies Package for Factory -> GHG Reporting (Toy Example)

Contains:
- factory_production.ttl           : Turtle schema + instances for FactoryProduction (Ontology A)
- ghg_report.ttl                  : Turtle schema + instances for GHGReport (Ontology B)
- emission_factor.ttl             : Turtle schema for EmissionFactor (Ontology C)
- factory_production.jsonld       : JSON-LD compact version of FactoryProduction instances
- ghg_report.jsonld               : JSON-LD compact version of GHG instances
- emission_factor.jsonld          : JSON-LD compact version of EmissionFactor instances
- llm_prompt_and_expected.json    : LLM prompt template and expected-output schema
- sparql_checks.sparql            : SPARQL queries for numeric checks and competency questions
- owl_constraints.ttl             : Simple OWL constraints for merged model
- README.md                       : This file

Usage:
- Load the Turtle files into your RDF store (e.g., Apache Jena Fuseki, RDF4J, RDFLib).
- Run SPARQL queries in sparql_checks.sparql to validate numeric computations.
- Use the LLM prompt as a template for generating merge mappings; always validate LLM output with the SPARQL/OWL checks.
