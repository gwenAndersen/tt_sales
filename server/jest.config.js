/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 10000,
  testMatch: ["<rootDir>/*.test.ts"],
  globalTeardown: "<rootDir>/globalTeardown.ts",
  moduleNameMapper: {
    "@shared/(.*)": "<rootDir>/shared/$1",
  },
};