module.exports = {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: [],
  moduleNameMapper: {
    '^@journium/js$': '<rootDir>/../../packages/journium-js/src',
    '^@journium/core$': '<rootDir>/../../packages/core/src',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'esnext',
          target: 'es2020',
          experimentalDecorators: true,
          emitDecoratorMetadata: false,
          moduleResolution: 'node',
          strict: false,
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
};
