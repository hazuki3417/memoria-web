import { MockedProvider } from "@apollo/client/testing"
import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { CommunitySettingsMembersDocument } from "@/infrastructure/graphql/generated"
import { SettingsSectionHost } from "@/ui/SettingsSectionHost"
import { ConnectedCommunityMembers } from "./ConnectedCommunityMembers"

/** Query/Mutation are owned by the selected Members controller. */
function ConnectedCommunityMembersStory() {
  return (
    <SettingsSectionHost label="Community設定を読み込み中">
      {(render) => (
        <ConnectedCommunityMembers
          communityId="club-a"
          onLeaveSuccess={() => undefined}
          render={render}
        />
      )}
    </SettingsSectionHost>
  )
}

const request = {
  query: CommunitySettingsMembersDocument,
  variables: { communityId: "club-a" },
}
const membersSuccess = {
  request,
  result: {
    data: {
      community: { id: "club-a" },
      communityMembers: [
        { userId: "user-a", nickname: "管理者A", role: "admin" },
        { userId: "user-b", nickname: "参加者B", role: "member" },
      ],
      me: { id: "user-a" },
    },
  },
}
const membersFailure = {
  request,
  error: new Error("Community Members取得失敗"),
}
const membersLoading = { ...membersSuccess, delay: 15_000 }

const meta = {
  title: "features/community-settings/members/ConnectedCommunityMembers",
  component: ConnectedCommunityMembersStory,
} satisfies Meta<typeof ConnectedCommunityMembersStory>
export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = {
  name: "Interaction · Section専用Queryからメンバーを表示",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[membersSuccess]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = await canvas.findByRole("table")
    await expect(within(table).getByText("管理者A")).toBeVisible()
    await expect(within(table).getByText("参加者B")).toBeVisible()
    await expect(within(table).getByText("自分")).toBeVisible()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}

export const Loading: Story = {
  name: "Interaction · メンバー取得中は未確定の表を表示しない",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[membersLoading]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole(
        "status",
        { name: "Community設定を読み込み中" },
        { timeout: 5_000 },
      ),
    ).toBeVisible()
    await expect(canvas.queryByRole("table")).not.toBeInTheDocument()
  },
}

export const ErrorRetry: Story = {
  name: "Interaction · メンバー取得失敗から再試行",
  tags: ["interaction"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[membersFailure, membersSuccess]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole("alert")).toBeVisible()
    await expect(canvas.queryByRole("table")).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "再試行" }))
    const table = await canvas.findByRole("table")
    await expect(within(table).getByText("管理者A")).toBeVisible()
    await expect(within(table).getByText("参加者B")).toBeVisible()
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}
