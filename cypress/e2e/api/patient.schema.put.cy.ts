/// <reference types="cypress" />

import YAML from "yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

describe("FHIR R4 - Dynamic Schema Validation for Patient PUT", () => {
  let schema: any;
  let patientId: string;

  before(() => {
    // Step 1: Fetch the OpenAPI YAML dynamically
    cy.request("https://hapi.fhir.org/baseR4/api-docs?page=Patient")
      .then((res) => {
        const doc = YAML.parse(res.body);

        // Step 2: Extract the PUT /Patient/{id} → 200 or 201 response schema
        const putSchemaRef =
          doc.paths?.["/Patient/{id}"]?.put?.responses?.["200"]?.content?.[
            "application/fhir+json"
          ]?.schema?.["$ref"] ||
          doc.paths?.["/Patient/{id}"]?.put?.responses?.["201"]?.content?.[
            "application/fhir+json"
          ]?.schema?.["$ref"];

        expect(putSchemaRef, "PUT /Patient schema reference").to.exist;

        // Step 3: Resolve the $ref from components
        const schemaKey = putSchemaRef.replace("#/components/schemas/", "");
        schema = doc.components.schemas[schemaKey];
        expect(schema, "Resolved schema").to.exist;
      });
  });

  it("creates and updates a Patient, validating the PUT response schema", () => {
    // Step 4: Create a Patient first
    cy.request({
      method: "POST",
      url: "/Patient",
      headers: { "Content-Type": "application/fhir+json" },
      body: {
        resourceType: "Patient",
        name: [{ family: "Naganathan", given: ["Jagan"] }],
        gender: "male",
        birthDate: "1980-12-25",
      },
    }).then((postRes) => {
      expect(postRes.status).to.eq(201);
      patientId = postRes.body.id;
      expect(patientId).to.exist;

      // Step 5: Perform PUT update
      return cy.request({
        method: "PUT",
        url: `/Patient/${patientId}`,
        headers: { "Content-Type": "application/fhir+json" },
        body: {
          resourceType: "Patient",
          id: patientId,
          name: [{ family: "Naganathan", given: ["Jagan Updated"] }],
          gender: "male",
          birthDate: "1980-12-25",
        },
      });
    }).then((putRes) => {
      expect([200, 201]).to.include(putRes.status);

      // Step 6: Validate PUT response against dynamic schema
      const ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(ajv);
      const validate = ajv.compile(schema);

      const valid = validate(putRes.body);
      if (!valid) {
        throw new Error(
          `Schema validation failed:\n${JSON.stringify(validate.errors, null, 2)}`
        );
      }

      expect(valid, "PUT response matches schema").to.be.true;
    });
  });
});
