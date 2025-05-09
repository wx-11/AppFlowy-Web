import { defineConfig } from 'cypress';

export default defineConfig({
  env: {
    codeCoverage: {
      exclude: ['cypress/**/*.*', '**/__tests__/**/*.*', '**/*.test.*'],
    },
  },
  watchForFileChanges: false,
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    setupNodeEvents(on, config) {
      return config;
    },
    supportFile: 'cypress/support/component.ts',
  },
  chromeWebSecurity: false,
  retries: {
    // Configure retry attempts for `cypress run`
    // Default is 0
    runMode: 10,
    // Configure retry attempts for `cypress open`
    // Default is 0
    openMode: 0,
  },
});
