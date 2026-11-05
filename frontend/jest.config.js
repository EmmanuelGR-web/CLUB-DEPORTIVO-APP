const nextJest = require('next/jest')

const crearConfig = nextJest({ dir: './' })

module.exports = crearConfig({
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.js'],
})
