/// <reference types="cypress" />
import yaml from 'js-yaml';

describe('FHIR R4 - Dynamic Schema Validation for Patient GET', () => {
  let getPatientSchema: any;
  let fhirJsonResourceSchema: any;
  let patientId: string;

  before(() => {
    // 🔹 Step 1: Fetch OpenAPI YAML dynamically
    cy.request('https://hapi.fhir.org/baseR4/api-docs?page=Patient').then((res) => {
      expect(res.status).to.eq(200);

      // 🔹 Step 2: Parse YAML → JSON
      const apiDoc = yaml.load(res.body);

      // 🔹 Step 3: Extract schema for GET /Patient/{id}
      const getPath = apiDoc.paths?.['/Patient/{id}']?.get;
      getPatientSchema =
        getPath?.responses?.['200']?.content?.['application/fhir+json']?.schema;

      // 🔹 Step 4: Resolve referenced schemas manually
      fhirJsonResourceSchema = apiDoc.components?.schemas?.['FHIR-JSON-RESOURCE'];

      if (getPatientSchema?.$ref) {
        const ref = getPatientSchema.$ref.split('/').pop();
        getPatientSchema = apiDoc.components?.schemas?.[ref] || fhirJsonResourceSchema;
      }

      if (!getPatientSchema) {
        throw new Error('❌ No GET /Patient/{id} schema found in OpenAPI doc');
      }

      cy.log('✅ Extracted and resolved GET /Patient/{id} schema dynamically');
    });

    // 🔹 Step 5: Create a patient to validate
    cy.request({
      method: 'POST',
      url: 'https://hapi.fhir.org/baseR4/Patient',
      headers: { 'Content-Type': 'application/fhir+json' },
      body: {
        resourceType: 'Patient',
        name: [{ use: 'official', family: 'DynamicGET', given: ['FHIRSchema'] }],
        gender: 'female',
        birthDate: '1985-01-01'
      }
    }).then((response) => {
      expect([200, 201]).to.include(response.status);
      patientId = response.body.id;
      cy.log(`✅ Created patient for validation: ${patientId}`);
    });
  });

  it('validates GET /Patient/{id} response against OpenAPI schema', () => {
    cy.request({
      method: 'GET',
      url: `https://hapi.fhir.org/baseR4/Patient/${patientId}`,
      headers: { Accept: 'application/fhir+json' }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.resourceType).to.eq('Patient');

      // ✅ Validate against resolved schema
      cy.wrap(response).validateSchema(getPatientSchema);

      cy.log('✅ Schema validation passed for GET /Patient/{id}');
    });
  });
});
