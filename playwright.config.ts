import { defineConfig, devices } from '@playwright/test';

const PORT = 4400;
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'off' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    { command: 'node tests/mp-mock.mjs', port: 4599, reuseExistingServer: !process.env.CI },
    {
      command: 'node server.mjs',
      port: PORT,
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: String(PORT),
        HOST: '127.0.0.1',
        SITE_URL: `http://localhost:${PORT}`,
        MP_API_BASE: 'http://localhost:4599',
        MP_ACCESS_TOKEN: 'TEST-token',
        DOWNLOAD_TOKEN_SECRET: 'test-secret',
        MP_WEBHOOK_SECRET: 'whsec-test',
        KIT_ARCHIVOS: JSON.stringify({ 'cabina-vol-1': 'http://localhost:4599/kit.zip' }),
        DATABASE_URL: process.env.TEST_DATABASE_URL ?? '',
      },
    },
  ],
});
