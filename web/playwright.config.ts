import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4310',
    trace: 'on-first-retry',
  },
  webServer: {
    // In CI the `out/` folder is built once by the `quality` job and shared as an artifact.
    // Locally this runs `next build`, which rewrites .next: restart a running `next dev` afterwards.
    command: process.env.E2E_PREBUILT ? 'npm run preview' : 'npm run build && npm run preview',
    url: 'http://127.0.0.1:4310',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
