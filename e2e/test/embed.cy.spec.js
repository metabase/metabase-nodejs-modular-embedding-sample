const TIMEOUT_MS = 20000;

describe("Embed.js: metabase-nodejs-embed-js-embedding-sample compatibility", () => {
  it("should load the guest embed page", () => {
    cy.visit("/");

    cy.findByText("Guest Embed").should("exist");
    cy.get("metabase-dashboard", { timeout: TIMEOUT_MS }).should("exist");
  });

  it("should load the SSO embed page", () => {
    cy.visit("/sso-embed");

    cy.findByText("SSO Embed").should("exist");
    cy.get("metabase-dashboard", { timeout: TIMEOUT_MS }).should("exist");
  });
});
