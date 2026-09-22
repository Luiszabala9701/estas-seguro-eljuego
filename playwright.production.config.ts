import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/production', outputDir: './test-results-production', workers: 1, timeout: 35000, reporter: 'list',
  use: { ...devices['Desktop Chrome'], channel: 'chrome', baseURL: 'http://127.0.0.1:4173', headless: true },
  webServer: { command: 'npm run preview', url: 'http://127.0.0.1:4173', reuseExistingServer: true }
});
