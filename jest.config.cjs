module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@decky/api$': '<rootDir>/tests/__mocks__/deckyApi.cjs',
    '^@decky/ui$': '<rootDir>/tests/__mocks__/deckyUi.cjs',
    '^decky-frontend-lib$': '<rootDir>/tests/__mocks__/decky-frontend-lib.cjs',
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.cjs',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.cjs'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: [
    '<rootDir>/tests/**/*.test.(ts|tsx|js)',
    '<rootDir>/tests/**/*.spec.(ts|tsx|js)'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.cjs'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};