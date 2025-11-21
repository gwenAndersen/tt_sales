/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'], // Keep this for ESM imports
  transform: {
    '^.+\.(ts|tsx|js|jsx)$': 'babel-jest', // Use babel-jest for all relevant files
  },
  transformIgnorePatterns: [
    'node_modules/(?!wouter)/'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  testMatch: ['<rootDir>/src/**/*.{test,spec}.{ts,tsx,js,jsx}'],
};

export default config;