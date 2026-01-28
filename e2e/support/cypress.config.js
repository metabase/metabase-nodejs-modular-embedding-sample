const { defineConfig } = require('cypress')
const path = require("path");

module.exports = defineConfig({
  e2e: {
    baseUrl: `http://localhost:${process.env.SERVER_PORT}`,
    supportFile: path.resolve(path.join(__dirname, './cypress.js')),
    specPattern: path.resolve(path.join(__dirname, '../test/**/*.cy.spec.js')),
    defaultBrowser: process.env.CYPRESS_BROWSER ?? "chrome",
  },
})
