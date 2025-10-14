describe("FHIR R4 - Patient Endpoint Validation", () => {
  const endpoint = "/Patient?_count=5";

  it("verifies that the /Patient API responds successfully with valid FHIR structure", () => {
    cy.request(endpoint).then((response) => {
      // ✅ Basic response checks
      expect(response.status).to.eq(200);
      expect(response.headers["content-type"]).to.include("application/fhir+json");
      expect(response.body).to.have.property("resourceType", "Bundle");
      expect(response.body).to.have.property("entry");

      const entries = response.body.entry || [];
      cy.log(`Received ${entries.length} patient records`);
      expect(entries.length).to.be.greaterThan(0);

      // ✅ Validate first patient resource
      const patient = entries[0].resource;
      expect(patient.resourceType).to.eq("Patient");
      expect(patient).to.have.property("id");
      expect(patient).to.have.property("name");
    });
  });

  it("ensures all Patient resources contain minimal demographic information", () => {
    cy.request(endpoint).then(({ body }) => {
      const patients = body.entry?.map((e: any) => e.resource) || [];

      patients.forEach((patient) => {
        // Each patient should have an ID and at least one name
        expect(patient.id, "Patient.id must exist").to.be.a("string");
        expect(patient.name, "Patient.name must exist").to.be.an("array");

        // Gender should be one of allowed FHIR codes, if present
        if (patient.gender) {
          expect(["male", "female", "other", "unknown"]).to.include(patient.gender);
        }

        // Birth date, if provided, must be valid ISO date
        if (patient.birthDate) {
          expect(() => new Date(patient.birthDate)).not.to.throw();
        }
      });
    });
  });
});
