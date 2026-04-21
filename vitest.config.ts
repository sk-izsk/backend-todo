import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    sequence: {
      concurrent: false,
    },
    testTimeout: 15000,
    hookTimeout: 15000,
  },
})