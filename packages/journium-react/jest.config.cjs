/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  // Root directory for tests
  roots: ['<rootDir>/src'],
  
  // Ignore the test-compat directory - those tests run in isolated environments
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/test-compat/'
  ],
  
  // Only look for test files in src directory
  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/*.{test,spec}.{ts,tsx}'
  ],
  
  // Module path aliases
  moduleNameMapper: {
    '^@journium/react$': '<rootDir>/src/index.tsx',
  },
  
  // Transform files with ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  
  // Setup files
  setupFilesAfterEnv: [],
  
  // Coverage options
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
  ],
};
