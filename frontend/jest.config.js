// Jest con la configuración de Next (compila con SWC y respeta los alias).
const nextJest = require('next/jest')

const crearConfig = nextJest({ dir: './' })

module.exports = crearConfig({
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.js'],
})
