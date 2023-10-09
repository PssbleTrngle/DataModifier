/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
   preset: 'ts-jest/presets/default-esm',
   extensionsToTreatAsEsm: ['.ts'],
   testEnvironment: 'node',
   setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
   transform: {
      '^.+\\.ts$': [
         'ts-jest',
         {
            useESM: true,
         },
      ],
   },
}
