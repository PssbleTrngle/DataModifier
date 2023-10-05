/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
   preset: 'ts-jest/presets/default-esm',
   rootDir: 'test',
   extensionsToTreatAsEsm: ['.ts'],
   testEnvironment: 'node',
   setupFilesAfterEnv: ['<rootDir>/setup.ts'],
   transform: {
      '^.+\\.ts$': [
         'ts-jest',
         {
            useESM: true,
         },
      ],
   },
}
