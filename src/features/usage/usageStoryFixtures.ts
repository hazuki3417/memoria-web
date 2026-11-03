import type { UsageData } from "./usageTypes"

// Productionでは利用せず、Component Storyの共通入力だけを定義する。
export const sampleUsage: UsageData = {
  usedBytes: 1_240_000_000,
  limitBytes: 5_000_000_000,
  mediaCount: 1248,
  formatBreakdown: [
    { format: "JPEG", count: 900, sizeBytes: 900_000_000 },
    { format: "PNG", count: 200, sizeBytes: 200_000_000 },
    { format: "WebP", count: 100, sizeBytes: 100_000_000 },
    { format: "HEIC / HEIF", count: 48, sizeBytes: 40_000_000 },
  ],
}

export const zeroUsage: UsageData = {
  usedBytes: 0,
  limitBytes: 5_000_000_000,
  mediaCount: 0,
  formatBreakdown: [],
}

/** Personal / Community共通のGraphQL Projection fixture。実際のQueryは各接続StoryでMockする。 */
export const graphqlUsageFixture = {
  mediaCount: 1248,
  storage: { usedBytes: "1240000000", effectiveLimitBytes: "5000000000" },
  formatBreakdown: [
    { format: "JPEG", mediaCount: 900, usedBytes: "900000000" },
    { format: "PNG", mediaCount: 200, usedBytes: "200000000" },
    { format: "WEBP", mediaCount: 100, usedBytes: "100000000" },
    { format: "HEIF", mediaCount: 48, usedBytes: "40000000" },
  ],
}

export const emptyGraphqlUsageFixture = {
  mediaCount: 0,
  storage: { usedBytes: "0", effectiveLimitBytes: "5000000000" },
  formatBreakdown: graphqlUsageFixture.formatBreakdown.map((item) => ({
    ...item,
    mediaCount: 0,
    usedBytes: "0",
  })),
}
