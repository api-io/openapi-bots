/* eslint-disable */
export default {
  roots: ['<rootDir>/tests'],
 

  testRegex: '^.+\\.test\\.ts$',
  displayName: 'style-guide',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
}


// module.exports = {
// //   roots: ['<rootDir>/tests'],
// //   transform: {
// //     '^.+\\.ts$': 'ts-jest',
// //   },
// //   testRegex: '^.+\\.test\\.ts$',
// //   moduleFileExtensions: ['ts', 'js'],
// //   moduleNameMapper: {
// //     '^nimma/fallbacks$':
// //       '<rootDir>/node_modules/nimma/dist/cjs/fallbacks/index.js',
// //     '^nimma/legacy$': '<rootDir>/node_modules/nimma/dist/legacy/cjs/index.js',
// //   },
// // }
