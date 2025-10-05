module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/integration/', // Skip integration tests (Azure Functions removed)
    '/tests/unit/upload.test.ts', // Skip upload tests (Azure Blob Storage removed)
    '/tests/unit/auth.test.ts', // Skip auth tests (Azure-specific auth removed)
    '/tests/unit/business.test.ts', // Skip business tests (written for Vitest not Jest)
    '/tests/unit/order.model.test.ts', // Skip order tests (written for Vitest not Jest)
  ],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};