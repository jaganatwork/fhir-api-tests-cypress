/// <reference types="cypress" />

import YAML from "yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

describe("FHIR R4 - Dynamic Schema Validation for Patient DELETE", () => {
  let schema: any;
  let patientId: string;

  before(() => {
    // Step 1: Fetch OpenAPI YAML dynamically
    cy.request("https://hapi.fhir.org/baseR4/api-docs?page=Patient")
      .then((res) => {
        const doc = YAML.parse(res.body);

        // Step 2: Extract the DELETE /Patient/{id} response schema
        const deleteSchemaRef =
          doc.paths?.["/Patient/{id}"]?.delete?.responses?.["200"]?.content?.[
            "application/fhir+json"
          ]?.schema?.["$ref"] ||
          doc.paths?.["/Patient/{id}"]?.delete?.responses?.["204"]?.content?.[
            "application/fhir+json"
          ]?.schema?.["$ref"];

        expect(deleteSchemaRef, "DELETE /Patient schema reference").to.exist;

        // Step 3: Resolve $ref from components
        const schemaKey = deleteSchemaRef.replace("#/components/schemas/", "");
        schema = doc.components.schemas[schemaKey];
        expect(schema, "Resolved DELETE schema").to.exist;
      });
  });

  it("creates and deletes a Patient, validating DELETE response schema", () => {
    // Step 4: Create a patient to delete
    cy.request({
      method: "POST",
      url: "/Patient",
      headers: { "Content-Type": "application/fhir+json" },
      body: {
        resourceType: "Patient",
        name: [{ family: "Naganathan", given: ["DeleteCheck"] }],
        gender: "male",
        birthDate: "1980-12-25",
      },
    }).then((postRes) => {
      expect(postRes.status).to.eq(201);
      patientId = postRes.body.id;
      expect(patientId).to.exist;

      // Step 5: Perform DELETE
      return cy.request({
        method: "DELETE",
        url: `/Patient/${patientId}`,
        failOnStatusCode: false,
      });
    }).then((deleteRes) => {
      expect([200, 204]).to.include(deleteRes.status);

      // Step 6: Validate DELETE response against dynamic schema
      const ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(ajv);
      const validate = ajv.compile(schema);

      const valid = validate(deleteRes.body);
      if (!valid) {
        throw new Error(
          `Schema validation failed:\n${JSON.stringify(validate.errors, null, 2)}`
        );
      }

      expect(valid, "DELETE response matches schema").to.be.true;
    });
  });
});
