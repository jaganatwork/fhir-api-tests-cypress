describe("FHIR R4 /Patient smoke", () => {
  it("returns at least one Patient", () => {
    cy.request("/Patient?_count=1").then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.resourceType).to.eq("Bundle");
      expect(res.body.entry?.length || 0).to.be.greaterThan(0);
    });
  });
});
