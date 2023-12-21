/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
   extensionsToTreatAsEsm: ['.ts'],
   testEnvironment: 'node',
   setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
   moduleNameMapper: {
      '(.+)\\.js': '$1',
   },
   transform: {
      '^.+\\.ts$': [
         'ts-jest',
         {
            useESM: true,
         },
      ],
   },
}
