const { jestConfig } = require("@salesforce/sfdx-lwc-jest/config");
module.exports = {
  ...jestConfig,
  moduleNameMapper: {
    "^lightning/messageService$":
      "<rootDir>/force-app/test/jest-mocks/lightning/messageService"
  },
  testPathIgnorePatterns: ["<rootDir>/.history/"]
};
