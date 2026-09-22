import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', fullyParallel: true, timeout: 35000, retries: 0,
  workers: 1, reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5173', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    { name: 'chrome-desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 1000 } } },
    { name: 'chrome-mobile', use: { ...devices['Pixel 7'], channel: 'chrome', viewport: { width: 390, height: 844 } } },
    { name: 'edge-desktop', use: { ...devices['Desktop Edge'], channel: 'msedge', viewport: { width: 1280, height: 900 } } }
  ],
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: true }
});
