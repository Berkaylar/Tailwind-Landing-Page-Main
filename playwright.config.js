const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests',
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:8765',
    headless: true,
    viewport: { width: 1280, height: 800 },
    video: 'on',
  },
})
