import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"
import { ApplicationContextSwitcher } from "./ApplicationContextSwitcher"

const personal = {
  id: "personal",
  kind: "personal" as const,
  label: "Personal",
  accentColor: "var(--mantine-color-blue-6)",
}
const family = {
  id: "family",
  kind: "community" as const,
  label: "家族のアルバム",
  accentColor: "var(--mantine-color-teal-6)",
}
const travel = {
  id: "travel",
  kind: "community" as const,
  label: "旅行の思い出",
  accentColor: "var(--mantine-color-violet-6)",
}
const friends = {
  id: "friends",
  kind: "community" as const,
  label: "友人との写真",
  accentColor: "var(--mantine-color-orange-6)",
}
const examples = [personal, family, travel, friends]

const meta = {
  title: "Components/Application Shell/Context Switcher",
  component: ApplicationContextSwitcher,
  args: {
    currentContext: personal,
    contexts: examples,
    onSelect: fn(),
    onCreateCommunity: fn(),
    onOpen: fn(),
    onRetry: fn(),
    loading: false,
    error: false,
  },
} satisfies Meta<typeof ApplicationContextSwitcher>

export default meta
type Story = StoryObj<typeof meta>

// Menu / ModalはPortalを使うため、Canvasではなくdocument.bodyから確認する。
const openSwitcher = async () => {
  const page = within(document.body)
  await userEvent.click(page.getByRole("button", { name: "コンテキストを切り替える" }))
  // Mantine MenuのPortal描画と開閉Transitionが完了してから検証する。
  await waitFor(() => expect(page.getByRole("menu")).toBeVisible())
  return page
}

export const Personal: Story = {
  name: "Visual · Personalを選択",
  tags: ["visual"],
  play: async () => { await openSwitcher() },
}

export const Community: Story = {
  name: "Visual · Communityを選択",
  tags: ["visual"],
  args: { currentContext: family },
  play: async () => { await openSwitcher() },
}

export const WithoutCreateCommunity: Story = {
  name: "Visual · Community作成なし",
  tags: ["visual"],
  args: { onCreateCommunity: undefined },
  play: async () => { await openSwitcher() },
}

export const NoCommunities: Story = {
  name: "Visual · 参加Communityなし",
  tags: ["visual"],
  args: { contexts: [personal] },
  play: async () => { await openSwitcher() },
}

export const Loading: Story = {
  name: "Visual · 初期取得中",
  tags: ["visual"],
  args: { contexts: [personal], loading: true },
  play: async () => { await openSwitcher() },
}

export const Refreshing: Story = {
  name: "Visual · 再取得中も候補を維持",
  tags: ["visual"],
  args: { loading: true },
  play: async () => { await openSwitcher() },
}

export const InitialError: Story = {
  name: "Visual · 初期取得失敗",
  tags: ["visual"],
  args: { contexts: [personal], error: true },
  play: async () => { await openSwitcher() },
}

export const RefreshError: Story = {
  name: "Visual · 再取得失敗時は候補を非表示",
  tags: ["visual"],
  args: { error: true },
  play: async () => {
    const page = await openSwitcher()
    await expect(await page.findByRole("alert")).toHaveTextContent("取得できませんでした。")
    await expect(page.queryByRole("menuitem", { name: "家族のアルバム" })).not.toBeInTheDocument()
  },
}

export const DuplicateDisplayNames: Story = {
  name: "Visual · 同じ表示名のCommunity",
  tags: ["visual"],
  args: {
    contexts: [
      personal,
      family,
      { ...travel, label: family.label },
      friends,
    ],
    currentContext: travel,
  },
  play: async () => { await openSwitcher() },
}

export const LongCommunityNames: Story = {
  name: "Visual · 長いCommunity名",
  tags: ["visual"],
  args: {
    contexts: [
      personal,
      { ...family, label: "家族旅行と日々の思い出を保存するための長いCommunity名を設定した場合の表示確認" },
      travel,
    ],
    currentContext: family,
  },
  play: async () => { await openSwitcher() },
}

export const ManyCommunities: Story = {
  name: "Visual · Community候補が多数",
  tags: ["visual"],
  args: {
    contexts: [
      ...examples,
      ...Array.from({ length: 18 }, (_, index) => ({
        id: `extra-${index}`,
        kind: "community" as const,
        label: `アルバム ${String(index + 1).padStart(2, "0")}`,
        accentColor: "var(--mantine-color-blue-6)",
      })),
    ],
  },
  play: async () => { await openSwitcher() },
}

export const Compact: Story = {
  name: "Visual · CompactのDialog",
  tags: ["visual"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: async () => { await openSwitcher() },
}

export const SearchMatches: Story = {
  name: "Interaction · 検索で一致候補を絞り込む",
  tags: ["interaction"],
  play: async () => {
    const page = await openSwitcher()
    await userEvent.type(page.getByRole("textbox", { name: "Communityを検索" }), "旅行")
    await expect(page.getByText("旅行の思い出")).toBeVisible()
    await expect(page.queryByText("家族のアルバム")).not.toBeInTheDocument()
  },
}

export const SearchNoMatches: Story = {
  name: "Visual · 検索結果なし",
  tags: ["visual"],
  play: async () => {
    const page = await openSwitcher()
    await userEvent.type(page.getByRole("textbox", { name: "Communityを検索" }), "存在しない名前")
    await expect(page.getByText("一致するCommunityはありません。")).toBeVisible()
  },
}

export const SearchSelectedCommunity: Story = {
  name: "Interaction · 選択中Communityは検索欄の上に固定",
  tags: ["interaction"],
  args: { currentContext: family },
  play: async () => {
    const page = await openSwitcher()
    const search = await page.findByRole("textbox", { name: "Communityを検索" })
    const selected = await page.findByRole("menuitem", { name: "家族のアルバム" })
    await expect(selected).toBeVisible()
    await expect(selected.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    await userEvent.type(search, "旅行")
    await expect(selected).toBeVisible()
    await expect(page.getByRole("menuitem", { name: "旅行の思い出" })).toBeVisible()
    await userEvent.clear(search)
    await userEvent.type(search, "家族")
    await expect(page.getAllByRole("menuitem", { name: "家族のアルバム" })).toHaveLength(1)
    await expect(page.getByText("一致するCommunityはありません。")).toBeVisible()
  },
}

export const SelectCommunity: Story = {
  name: "Interaction · Communityの選択",
  tags: ["interaction"],
  play: async ({ args }) => {
    const page = await openSwitcher()
    await userEvent.click(page.getByText("旅行の思い出"))
    await expect(args.onSelect).toHaveBeenCalledWith("travel")
  },
}

export const RetryError: Story = {
  name: "Interaction · 取得失敗から再試行",
  tags: ["interaction"],
  args: { contexts: [personal], error: true },
  play: async ({ args }) => {
    const page = await openSwitcher()
    await userEvent.click(page.getByRole("button", { name: "再試行" }))
    await expect(args.onRetry).toHaveBeenCalledTimes(1)
  },
}
