describe("FHIR R4 - Patient CRUD Workflow", () => {
  const patientResource = {
    resourceType: "Patient",
    name: [{ use: "official", family: "Naganathan", given: ["Jagan"] }],
    gender: "male",
    birthDate: "1980-12-25"
  };

  let patientId: string;

  /**
   * Helper to log with emoji
   */
  const logStep = (msg: string) => cy.log(`🩺 ${msg}`);

  it("creates a new Patient record (POST)", () => {
    logStep("Creating new patient via POST /Patient");

    cy.request({
      method: "POST",
      url: "/Patient",
      body: patientResource,
      headers: { "Content-Type": "application/fhir+json" }
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body.resourceType).to.eq("Patient");

      // Capture patient ID
      patientId = res.body.id;
      expect(patientId, "Patient ID must be defined").to.be.a("string");

      Cypress.env("patientId", patientId);
      logStep(`Patient created successfully → ID: ${patientId}`);
    });
  });

  it("retrieves the created Patient record (GET)", () => {
    patientId = Cypress.env("patientId");
    logStep(`Fetching Patient with ID: ${patientId}`);

    cy.request({
      method: "GET",
      url: `/Patient/${patientId}`
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.resourceType).to.eq("Patient");
      expect(res.body.id).to.eq(patientId);
      expect(res.body.name[0].given[0]).to.eq("Jagan");
    });
  });

  it("updates the Patient record (PUT)", () => {
    patientId = Cypress.env("patientId");
    const updated = {
      ...patientResource,
      id: patientId,
      name: [{ use: "official", family: "Naganathan", given: ["Jaganathan"] }]
    };

    logStep(`Updating Patient ${patientId} → new name`);

    cy.request({
      method: "PUT",
      url: `/Patient/${patientId}`,
      body: updated,
      headers: { "Content-Type": "application/fhir+json" }
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.body.resourceType).to.eq("Patient");
      expect(res.body.name[0].given[0]).to.eq("Jaganathan");
    });
  });

  it("deletes the Patient record (DELETE)", () => {
    patientId = Cypress.env("patientId");
    logStep(`Deleting Patient with ID: ${patientId}`);

    cy.request({
      method: "DELETE",
      url: `/Patient/${patientId}`,
      failOnStatusCode: false
    }).then((res) => {
      // HAPI FHIR returns 204 or 200 for successful deletes
      expect([200, 204]).to.include(res.status);
      logStep(`Patient ${patientId} deleted successfully`);
    });
  });

it("verifies the Patient record no longer exists (GET 404 or 410)", () => {
  patientId = Cypress.env("patientId");
  cy.log(`Verifying deletion for Patient: ${patientId}`);

  cy.request({
    method: "GET",
    url: `/Patient/${patientId}`,
    failOnStatusCode: false
  }).then((res) => {
    // 404 = Not Found, 410 = Gone (deleted)
    expect([404, 410]).to.include(res.status);
    cy.log(`Patient ${patientId} is confirmed deleted with status ${res.status}`);
  });
});

});
