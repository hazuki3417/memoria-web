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


function RetryContractStory({ scope }: { scope: "personal" | "community" }) {
  const [status, setStatus] = useState<"error" | "ready">("error")
  const [retryCount, setRetryCount] = useState(0)
  return (
    <>
      <span data-testid="retry-count">{retryCount}</span>
      <SettingsUsage
        usage={sampleUsage}
        scope={scope}
        status={status}
        onRetry={() => {
          setRetryCount((count) => count + 1)
          setStatus("ready")
        }}
      />
    </>
  )
}

function ModeLifetimeContractStory() {
  const [scope, setScope] = useState<"personal" | "community">("personal")
  return (
    <>
      <Button onClick={() => setScope((current) => current === "personal" ? "community" : "personal")}>
        Scopeを切り替え
      </Button>
      <SettingsUsage key={scope} usage={sampleUsage} scope={scope} />
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
    await expect(canvas.getAllByText("1.24 GB").length).toBeGreaterThan(0)
    await expect(canvas.getByText("3.76 GB")).toBeVisible()
    await expect(canvas.getAllByText("5 GB").length).toBeGreaterThan(0)
    const table = canvas.getByRole("table")
    const rows = within(table).getAllByRole("row")
    await expect(rows).toHaveLength(6) // 1 header + 4 formats + 1 total
    const formats = [
      ["JPEG", "900 件", "0.90 GB"],
      ["PNG", "200 件", "0.20 GB"],
      ["WebP", "100 件", "0.10 GB"],
      ["HEIC / HEIF", "48 件", "0.04 GB"],
    ]
    for (const [name, count, size] of formats) {
      const row = within(table).getByRole("row", { name: new RegExp(name.replace("/", "\\/")) })
      await expect(row).toHaveTextContent(count)
      await expect(row).toHaveTextContent(size)
    }
    const footer = rows[5]
    await expect(footer).toHaveTextContent("合計")
    await expect(footer).toHaveTextContent("1,248 件")
    await expect(footer).toHaveTextContent("1.24 GB")
    await expect(canvas.getByLabelText(/ストレージ使用率 24.8%/)).toBeInTheDocument()
  },
}

// 初期表示で使用量降順が有効になり、ソート解除で標準順へ戻る。
export const DefaultSortContract: Story = {
  name: "Interaction · 使用量降順の初期表示と解除",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole("table")
    const sizeHeader = within(table).getByRole("columnheader", { name: /使用量/ })
    await expect(sizeHeader).toHaveAttribute("aria-sort", "descending")
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("JPEG")
    await userEvent.click(canvas.getByRole("button", { name: "使用量で並べ替え" }))
    await expect(sizeHeader).toHaveAttribute("aria-sort", "none")
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("JPEG")
    await userEvent.click(canvas.getByRole("button", { name: "使用量で並べ替え" }))
    await expect(sizeHeader).toHaveAttribute("aria-sort", "ascending")
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("HEIC / HEIF")
  },
}

// SO-01: API返却順が使用量順でなくても初期表示は正本byte数の降順になる。
// Personal / Community共通Componentで同じ初期sort contractを確認する。
export const ShuffledDefaultSortContract: Story = {
  name: "Interaction · API順に依存しない初期使用量降順（SO-01）",
  tags: ["interaction"],
  args: {
    usage: {
      ...sampleUsage,
      formatBreakdown: [
        { format: "HEIC / HEIF", count: 48, sizeBytes: 40_000_000 },
        { format: "WebP", count: 100, sizeBytes: 100_000_000 },
        { format: "JPEG", count: 900, sizeBytes: 900_000_000 },
        { format: "PNG", count: 200, sizeBytes: 200_000_000 },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const table = within(canvasElement).getByRole("table")
    await expect(within(table).getByRole("columnheader", { name: /使用量/ })).toHaveAttribute("aria-sort", "descending")
    const rows = within(table).getAllByRole("row").slice(1, 5)
    for (const [index, format] of ["JPEG", "PNG", "WebP", "HEIC / HEIF"].entries()) {
      await expect(rows[index]).toHaveTextContent(format)
    }
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
    await expect(canvas.getAllByText("0 GB").length).toBeGreaterThan(0)
    await expect(canvas.getAllByText("5 GB")[0]).toBeVisible()
    const table = canvas.getByRole("table")
    const rows = within(table).getAllByRole("row")
    await expect(rows).toHaveLength(6)
    for (const format of ["JPEG", "PNG", "WebP", "HEIC / HEIF"]) {
      const row = within(table).getByRole("row", { name: new RegExp(format.replace("/", "\\/")) })
      await expect(row).toHaveTextContent("0 件")
      await expect(row).toHaveTextContent("0 GB")
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
    await expect(canvas.getAllByText("5 GB").length).toBeGreaterThan(0)
    await expect(canvas.getByText("0 GB")).toBeVisible()
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
    await expect(canvas.getAllByText("4.66 GiB")[0]).toBeVisible()
    await expect(canvas.getAllByText("1.15 GiB")[0]).toBeVisible()
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
    await expect(canvas.getAllByText("5 GB")[0]).toBeVisible()
    await expect(table).toHaveTextContent("1,248 件")
    await userEvent.click(canvas.getByRole("button", { name: "Binaryに変更" }))
    await expect(canvas.getAllByText("4.66 GiB")[0]).toBeVisible()
    await expect(table).toHaveTextContent("1.15 GiB")
    await expect(table).toHaveTextContent("1,248 件")
    await expect(canvas.getByLabelText(/ストレージ使用率 24.8%/)).toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "Decimalに戻す" }))
    await expect(canvas.getAllByText("5 GB")[0]).toBeVisible()
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

// 0件の内訳では件数・使用量の昇順・降順でも形式順を変えず、3回目で未ソートへ戻る。
export const ZeroSortContract: Story = {
  name: "Interaction · 0件の安定ソートとソート解除",
  tags: ["interaction"],
  args: { usage: zeroUsage },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole("table")
    const getFormats = () => within(table).getAllByRole("row").slice(1, 5).map((row) => within(row).getAllByRole("cell")[0].textContent)
    const initial = getFormats()
    await expect(within(table).getByRole("columnheader", { name: /使用量/ })).toHaveAttribute("aria-sort", "descending")
    for (const [label, directions] of [
      ["使用量", ["none", "ascending", "descending"]],
      ["登録件数", ["ascending", "descending", "none"]],
    ] as const) {
      for (const direction of directions) {
        await userEvent.click(canvas.getByRole("button", { name: `${label}で並べ替え` }))
        await expect(within(table).getByRole("columnheader", { name: new RegExp(label) })).toHaveAttribute("aria-sort", direction)
        await expect(getFormats()).toEqual(initial)
      }
    }
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
    await expect(canvas.getAllByText("1.24 GB")[0]).toBeVisible()
    await expect(canvas.getByRole("table")).toHaveTextContent("1,248 件")
    await expect(canvas.getByRole("table")).toHaveTextContent("HEIC / HEIF")
  },
}

// 容量と割合をページ全体で切り替え、内訳の列数・ソート状態を維持する。
export const DisplayModeSwitchContract: Story = {
  name: "Interaction · 容量／割合の一括切替",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole("table")
    await expect(canvas.getAllByText("1.24 GB").length).toBeGreaterThan(0)
    await userEvent.click(canvas.getByRole("radio", { name: "割合" }))
    await expect(canvas.getAllByText("24.8%").length).toBeGreaterThan(0)
    await expect(within(table).getByRole("columnheader", { name: /使用量/ })).toBeVisible()
    await expect(within(table).getAllByRole("row")).toHaveLength(6)
    await expect(canvas.getAllByText("5 GB")[0]).toBeVisible()
    await userEvent.click(canvas.getByRole("button", { name: "使用量で並べ替え" }))
    await userEvent.click(canvas.getByRole("button", { name: "使用量で並べ替え" }))
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("HEIC / HEIF")
    await userEvent.click(canvas.getByRole("radio", { name: "容量" }))
    await expect(within(table).getByRole("columnheader", { name: /使用量/ })).toHaveAttribute("aria-sort", "ascending")
    await expect(within(table).getAllByRole("row")[1]).toHaveTextContent("HEIC / HEIF")
  },
}


// SS-02/03: Errorは必ず再試行可能であり、操作後にReadyへ復旧する（API接続なし）。
export const ErrorRetryContract: Story = {
  name: "Interaction · 取得失敗と再試行（SS-02/SS-03）",
  tags: ["interaction"],
  render: () => <RetryContractStory scope="personal" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("alert")).toHaveTextContent("利用状況を取得できませんでした")
    await expect(canvas.getByRole("alert")).toHaveTextContent("通信状況を確認して、もう一度お試しください。")
    await expect(canvas.queryByRole("table")).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    await expect(canvas.getByTestId("retry-count")).toHaveTextContent("1")
    await expect(canvas.getByRole("table")).toBeVisible()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

// UI-14: 表示モードはコンポーネント存続中のみ保持し、別scopeへ持ち越さない。
export const DisplayModeLifetimeContract: Story = {
  name: "Interaction · 表示モードの初期値とscope間独立（UI-14）",
  tags: ["interaction"],
  render: () => <ModeLifetimeContractStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("radio", { name: "容量" })).toBeChecked()
    await userEvent.click(canvas.getByRole("radio", { name: "割合" }))
    await expect(canvas.getByRole("radio", { name: "割合" })).toBeChecked()
    await userEvent.click(canvas.getByRole("button", { name: "Scopeを切り替え" }))
    await expect(canvas.getByText("このCommunityが管理する登録済みオリジナルファイルの使用状況を確認します。")).toBeVisible()
    await expect(canvas.getByRole("radio", { name: "容量" })).toBeChecked()
  },
}

// Play無しの静的StoryのみをVRT候補とし、画像Baselineは別途Visual Reviewで承認する。
export const VrtReady: Story = { name: "VRT · Ready", tags: ["vrt"] }
export const VrtEmpty: Story = { name: "VRT · 0件", tags: ["vrt"], args: { usage: zeroUsage } }
export const VrtLoading: Story = { name: "VRT · Loading", tags: ["vrt"], args: { status: "loading" } }
export const VrtError: Story = { name: "VRT · Error / Retry", tags: ["vrt"], args: { status: "error", onRetry: () => undefined } }
export const VrtLimit: Story = { name: "VRT · 上限到達", tags: ["vrt"], args: { usage: limitReachedUsage } }
export const VrtCommunity: Story = { name: "VRT · Community", tags: ["vrt"], args: { scope: "community" } }
