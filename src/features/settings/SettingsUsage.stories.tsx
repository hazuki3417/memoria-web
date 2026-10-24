import { Button, Group } from "@mantine/core"
import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { SettingsUsage } from "./SettingsUsage"
import { sampleUsage, zeroUsage } from "./usageStoryFixtures"

function UnitPreferenceStory() {
  const [unit, setUnit] = useState<"DECIMAL" | "BINARY">("DECIMAL")

  return (
    <>
      <Group mb="md">
        <Button onClick={() => setUnit("BINARY")}>Binaryに変更</Button>
        <Button onClick={() => setUnit("DECIMAL")}>Decimalに戻す</Button>
      </Group>
      <SettingsUsage usage={sampleUsage} fileSizeUnit={unit} />
    </>
  )
}

const limitReachedUsage = {
  usedBytes: 5_000_000_000,
  limitBytes: 5_000_000_000,
  mediaCount: 5000,
  formatBreakdown: [{ format: "JPEG", count: 5000, sizeBytes: 5_000_000_000 }],
}

const meta = {
  title: "Features/Settings/Usage/Usage Contract",
  component: SettingsUsage,
  args: { usage: sampleUsage, fileSizeUnit: "DECIMAL", scope: "personal" },
} satisfies Meta<typeof SettingsUsage>

export default meta
type Story = StoryObj<typeof meta>

// ST-01・ST-04・ST-08・FM-01・FM-05・UN-01・UI-04:
// UIに渡された確定済み集計値の表示だけを保証し、Backendの集計処理は保証しない。
export const ReadyValuesContract: Story = {
  name: "Interaction · 使用量・内訳・合計の表示（ST-01/ST-04/ST-08/FM-01/FM-05/UN-01/UI-04）",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByLabelText("1.24 GB ( 24.8 % )")).toBeVisible()
    await expect(canvas.getByLabelText("3.76 GB ( 75.2 % )")).toBeVisible()
    await expect(canvas.getByLabelText("5 GB ( 100 % )")).toBeVisible()
    const table = canvas.getByRole("table")
    const rows = within(table).getAllByRole("row")
    await expect(rows).toHaveLength(6) // 1 header + 4 formats + 1 total
    const formats = [
      ["JPEG", "900 件", "0.90 GB", "18 %"],
      ["PNG", "200 件", "0.20 GB", "4 %"],
      ["WebP", "100 件", "0.10 GB", "2 %"],
      ["HEIC / HEIF", "48 件", "0.04 GB", "0.8 %"],
    ]
    for (const [name, count, size, percent] of formats) {
      const row = within(table).getByRole("row", { name: new RegExp(name.replace("/", "\\/")) })
      await expect(row).toHaveTextContent(count)
      await expect(row).toHaveTextContent(size)
      await expect(row).toHaveTextContent(percent)
    }
    const footer = rows[5]
    await expect(footer).toHaveTextContent("合計")
    await expect(footer).toHaveTextContent("1,248 件")
    await expect(footer).toHaveTextContent("1.24 GB")
    await expect(canvas.getByLabelText(/ストレージ使用率 24.8%/)).toBeInTheDocument()
  },
}

// FM-06: format行にMedia選択・削除・変換のActionを提供しない。
export const BreakdownReadOnlyContract: Story = {
  name: "Interaction · 内訳に一括操作なし（FM-06）",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const table = within(canvasElement).getByRole("table")
    for (const name of ["JPEG", "PNG", "WebP", "HEIC / HEIF"]) {
      const row = within(table).getByRole("row", { name: new RegExp(name.replace("/", "\\/")) })
      await expect(within(row).queryByRole("button")).not.toBeInTheDocument()
      await expect(within(row).queryByRole("checkbox")).not.toBeInTheDocument()
      await expect(within(row).queryByRole("link")).not.toBeInTheDocument()
    }
  },
}

// ST-03 / SS-05: 取得成功後の実値0はLoading / Errorと区別される。
export const ZeroUsageContract: Story = {
  name: "Interaction · 確定0件（ST-03/SS-05）",
  tags: ["interaction"],
  args: { usage: zeroUsage },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByLabelText("0 GB ( 0 % )")).toBeVisible()
    await expect(canvas.getAllByLabelText("5 GB ( 100 % )")).toHaveLength(2)
    const table = canvas.getByRole("table")
    const rows = within(table).getAllByRole("row")
    await expect(rows).toHaveLength(6)
    for (const format of ["JPEG", "PNG", "WebP", "HEIC / HEIF"]) {
      const row = within(table).getByRole("row", { name: new RegExp(format.replace("/", "\\/")) })
      await expect(row).toHaveTextContent("0 件")
      await expect(row).toHaveTextContent("0 GB")
      await expect(row).toHaveTextContent("0 %")
    }
    await expect(table).toHaveTextContent("合計")
    await expect(table).toHaveTextContent("0 件")
    await expect(canvas.queryByRole("status", { name: "利用状況を読み込んでいます" })).not.toBeInTheDocument()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

// ST-05 / SS-06: 使用率100%でも上限を越えた利用可能量を示さない。
export const LimitReachedContract: Story = {
  name: "Interaction · 上限到達（ST-05/SS-06）",
  tags: ["interaction"],
  args: { usage: limitReachedUsage },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByLabelText("5 GB ( 100 % )")).toHaveLength(2)
    await expect(canvas.getByLabelText("0 GB ( 0 % )")).toBeVisible()
    await expect(canvas.getByLabelText(/ストレージ使用率 100%/)).toBeInTheDocument()
    await expect(canvas.getByRole("table")).toHaveTextContent("5,000 件")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

// UN-02: 非10進単位を使用し、正本のbyte値からGiBへ換算して表示。
export const BinaryDisplayContract: Story = {
  name: "Interaction · Binary換算（UN-02）",
  tags: ["interaction"],
  args: { fileSizeUnit: "BINARY" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByLabelText("4.66 GiB ( 100 % )")).toBeVisible()
    await expect(canvas.getByLabelText("1.15 GiB ( 24.8 % )")).toBeVisible()
    await expect(canvas.getByRole("table")).toHaveTextContent("0.84 GiB")
    await expect(canvas.getByRole("table")).toHaveTextContent("1,248 件")
  },
}

// UN-03: ComponentへのPreference変更を反映しても件数・割合は不変。
// Preferenceの保存・同期およびGraphQLでの再取得は本テストの対象外。
export const UnitPreferenceChangeContract: Story = {
  name: "Interaction · 表示単位切替（UN-03）",
  tags: ["interaction"],
  render: () => <UnitPreferenceStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole("table")
    await expect(canvas.getByLabelText("5 GB ( 100 % )")).toBeVisible()
    await expect(table).toHaveTextContent("1,248 件")
    await userEvent.click(canvas.getByRole("button", { name: "Binaryに変更" }))
    await expect(canvas.getByLabelText("4.66 GiB ( 100 % )")).toBeVisible()
    await expect(table).toHaveTextContent("1.15 GiB")
    await expect(table).toHaveTextContent("1,248 件")
    await expect(canvas.getByLabelText(/ストレージ使用率 24.8%/)).toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "Decimalに戻す" }))
    await expect(canvas.getByLabelText("5 GB ( 100 % )")).toBeVisible()
    await expect(table).toHaveTextContent("1.24 GB")
    await expect(table).toHaveTextContent("1,248 件")
  },
}

// SS-01: Loadingでは確定値を露出せず、空データと誤認させない。
export const LoadingContract: Story = {
  name: "Interaction · 未確定値を隠す（SS-01）",
  tags: ["interaction"],
  args: { status: "loading" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("status", { name: "利用状況を読み込んでいます" })).toBeVisible()
    await expect(canvas.queryByText("1.24 GB")).not.toBeInTheDocument()
    const table = canvas.getByRole("table")
    await expect(within(table).getAllByRole("row")).toHaveLength(6)
    await expect(within(table).getAllByRole("row")[5]).toHaveTextContent("合計")
    await expect(canvas.getByRole("button", { name: "使用量で並べ替え" })).toBeDisabled()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

// Communityの表示差異のみ確認する。scopeがサーバーで隔離される保証ではない。
export const CommunityDisplayContract: Story = {
  name: "Interaction · Community Usage表示（ST-04/FM-01）",
  tags: ["interaction"],
  args: { scope: "community" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("このCommunityが管理する登録済みオリジナルファイルの使用状況を確認します。")).toBeVisible()
    await expect(canvas.getByLabelText("1.24 GB ( 24.8 % )")).toBeVisible()
    await expect(canvas.getByRole("table")).toHaveTextContent("1,248 件")
    await expect(canvas.getByRole("table")).toHaveTextContent("HEIC / HEIF")
  },
}
