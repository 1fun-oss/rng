import type { Config } from 'jest';

export default async (): Promise<Config> => {
  return {
    verbose: true,
    testEnvironment: 'node',
    transform: {
      '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
  };
};
