describe("FHIR R4 - Condition CRUD Workflow", () => {
  let conditionId: string;

  const baseCondition = {
    resourceType: "Condition",
    clinicalStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
          code: "active",
        },
      ],
    },
    code: { text: "Hypertension" },
    subject: { reference: "Patient/example" },
  };

  const logStep = (msg: string) => cy.log(`🧬 ${msg}`);

  it("creates a new Condition (POST)", () => {
    logStep("Creating new Condition via POST /Condition");

    cy.request({
      method: "POST",
      url: "/Condition",
      body: baseCondition,
      headers: { "Content-Type": "application/fhir+json" },
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body.resourceType).to.eq("Condition");

      conditionId = res.body.id;
      expect(conditionId, "Condition ID must exist").to.be.a("string");

      Cypress.env("conditionId", conditionId);
      logStep(`Condition created successfully → ID: ${conditionId}`);
    });
  });

  it("retrieves the Condition (GET)", () => {
    conditionId = Cypress.env("conditionId");
    logStep(`Retrieving Condition ${conditionId}`);

    cy.request({
      method: "GET",
      url: `/Condition/${conditionId}`,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.resourceType).to.eq("Condition");
      expect(res.body.id).to.eq(conditionId);
      expect(res.body.clinicalStatus.coding[0].code).to.eq("active");
    });
  });

  it("updates the Condition (PUT)", () => {
    conditionId = Cypress.env("conditionId");
    const updatedCondition = {
      ...baseCondition,
      id: conditionId,
      clinicalStatus: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
            code: "resolved",
          },
        ],
      },
    };

    logStep(`Updating Condition ${conditionId} → resolved`);

    cy.request({
      method: "PUT",
      url: `/Condition/${conditionId}`,
      body: updatedCondition,
      headers: { "Content-Type": "application/fhir+json" },
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.body.resourceType).to.eq("Condition");
      expect(res.body.clinicalStatus.coding[0].code).to.eq("resolved");
    });
  });

  it("deletes the Condition (DELETE)", () => {
    conditionId = Cypress.env("conditionId");
    logStep(`Deleting Condition ${conditionId}`);

    cy.request({
      method: "DELETE",
      url: `/Condition/${conditionId}`,
      failOnStatusCode: false,
    }).then((res) => {
      expect([200, 204]).to.include(res.status);
      logStep(`Condition ${conditionId} deleted successfully`);
    });
  });

  it("verifies the Condition no longer exists (GET 404 or 410)", () => {
    conditionId = Cypress.env("conditionId");
    logStep(`Verifying deletion for Condition ${conditionId}`);

    cy.request({
      method: "GET",
      url: `/Condition/${conditionId}`,
      failOnStatusCode: false,
    }).then((res) => {
      expect([404, 410]).to.include(res.status);
      logStep(`Condition ${conditionId} confirmed deleted (status ${res.status})`);
    });
  });

  it("searches for Conditions (GET /Condition?_count=5)", () => {
    logStep("Searching for Conditions");

    cy.request({
      method: "GET",
      url: "/Condition?_count=5",
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.resourceType).to.eq("Bundle");

      const entries = res.body.entry || [];
      expect(entries.length).to.be.greaterThan(0);
      logStep(`Found ${entries.length} Condition resources`);
    });
  });
});
