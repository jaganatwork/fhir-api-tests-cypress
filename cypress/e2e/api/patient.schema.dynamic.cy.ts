/// <reference types="cypress" />
 import yaml from 'js-yaml'; // Add this import at the top if needed (npm i js-yaml)

// Validates a live POST /Patient response body against the Patient schema
// fetched dynamically from HAPI FHIR's OpenAPI spec.
describe('FHIR R4 - Dynamic Schema Validation for Patient POST', () => {
  let postPatientSchema: any;

  // 1) Fetch swagger/openapi spec and extract POST /Patient -> 201 response schema

before(() => {
  const apiDocsUrl = 'https://hapi.fhir.org/baseR4/api-docs?page=Patient';

  cy.request('GET', apiDocsUrl)
    .then((res) => {
      // Some HAPI servers return YAML; convert if necessary
      let swaggerDoc = res.body;
      if (typeof swaggerDoc === 'string') {
        try {
          swaggerDoc = yaml.load(swaggerDoc);
        } catch (e) {
          throw new Error('Unable to parse YAML OpenAPI spec');
        }
      }

      const postDef = swaggerDoc.paths?.['/Patient']?.post;
      expect(postDef, 'POST /Patient definition').to.exist;

      // HAPI FHIR uses 200 for successful creation instead of 201
      const response =
        postDef.responses?.['200'] ||
        postDef.responses?.['201'] ||
        postDef.responses?.default;

      expect(response, 'Response schema for POST /Patient').to.exist;

      const content =
        response.content?.['application/fhir+json'] ||
        response.content?.['application/json'] ||
        response.content?.['*/*'];
      expect(content, 'Response content section').to.exist;

      const schemaRef = content.schema?.$ref;
      expect(schemaRef, 'POST /Patient schema reference').to.exist;

      const schemaName = schemaRef.split('/').pop();
      postPatientSchema = swaggerDoc.components?.schemas?.[schemaName];
      expect(postPatientSchema, `Resolved schema ${schemaName}`).to.exist;

      cy.log(`✅ Extracted schema: ${schemaName}`);
    });
});
  // 2) Create a Patient and validate the response with the fetched schema
  it('creates a Patient and validates response against OpenAPI schema', () => {
    cy.request({
      method: 'POST',
      url: 'https://hapi.fhir.org/baseR4/Patient',
      headers: { 'Content-Type': 'application/fhir+json' },
      body: {
        resourceType: 'Patient',
        name: [{ use: 'official', family: 'Naganathan', given: ['Jagan'] }],
        gender: 'male',
        birthDate: '1980-12-25'
      }
    }).then((response) => {
      expect([200, 201]).to.include(response.status);

      // Validate using cypress-ajv-schema-validator
    cy.wrap(response).validateSchema(postPatientSchema);

      cy.log(`✅ Created Patient ID: ${response.body.id}`);
    });
  });
});
