const { jestConfig } = require("@salesforce/sfdx-lwc-jest/config");
module.exports = {
  ...jestConfig,
  moduleNameMapper: {
    "^lightning/messageService$":
      "<rootDir>/force-app/test/jest-mocks/lightning/messageService",
    "^lightning/platformShowToastEvent$":
      "<rootDir>/force-app/test/jest-mocks/lightning/platformShowToastEvent"
  },
  testPathIgnorePatterns: ["<rootDir>/.history/", "<rootDir>/force-test/"],
  collectCoverageFrom: [
    "<rootDir>/force-app/**/*.js"
  ]
};
