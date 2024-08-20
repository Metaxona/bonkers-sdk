// vitest.config.ts
import { defineConfig } from 'vitest/config'

const REPORTS_BASE = "./test/reports/html"

export default defineConfig({
  test: {
    coverage: {
      include: ["src/*"],
      exclude: ["src/index.ts", "src/wagmi_viem/*"],
      provider: 'v8', // 'istanbul' or 'v8'
      reporter: ['json-summary', 'text', 'json', 'html'],
      reportsDirectory: `${REPORTS_BASE}/coverage`,
      cleanOnRerun: true,
      enabled: true
    },
    reporters: ['verbose', 'json', 'html', 'junit', 'github-actions'],
    outputFile: `${REPORTS_BASE}/index.html`,
    hookTimeout: 120000,
    testTimeout: 60000,
    // retry: 1,
    globalSetup: './test/common/globalSetup.ts',
    setupFiles: './test/common/setup.ts',
    // disabled since only a single instance of anvil is available during the test
    // and file parallelism causes a race condition causing nonce too low errors 
    fileParallelism: false,
    watch: false
  },
})