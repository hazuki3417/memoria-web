import { SettingsUsage } from "@/features/settings"

// Static sample data until the Usage data connection is implemented.
const usage = {
  usedStorageLabel: "1.24 GB",
  effectiveLimitLabel: "5 GB",
  storageUsagePercent: 24.8,
  mediaCount: 1248,
  formatBreakdown: [
    { format: "JPEG", count: 900, sizeLabel: "0.90 GB" },
    { format: "PNG", count: 200, sizeLabel: "0.20 GB" },
    { format: "WebP", count: 100, sizeLabel: "0.10 GB" },
    { format: "HEIC / HEIF", count: 48, sizeLabel: "0.04 GB" },
  ],
}

export default function Page() {
  return <SettingsUsage usage={usage} />
}
