import { MockedProvider } from "@apollo/client/testing"
import { Box, Paper, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { CurrentUserDocument, MyCommunitiesDocument } from "@/infrastructure/graphql/generated"
import { ApplicationShellContainer } from "./ApplicationShellContainer"

const user = {
  id: "user-a",
  profile: { nickname: "Memoria User" },
  preferences: { personalAccentColor: "#3366CC" },
}
const communities = [
  {
    id: "community-a",
    name: "家族のアルバム",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    mySettings: { accentColor: "#00AA88", alias: null },
  },
]
const success = [
  { request: { query: CurrentUserDocument }, result: { data: { me: user } } },
  { request: { query: MyCommunitiesDocument }, result: { data: { myCommunities: communities } } },
]
const meta = {
  title: "Features/Application Shell/Connected Container",
  component: ApplicationShellContainer,
  parameters: { layout: "fullscreen", nextjs: { navigation: { pathname: "/dashboard" } } },
  decorators: [
    (Story) => (
      <MockedProvider mocks={success} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  args: {
    children: (
      <Box maw={1120} mx="auto" p="md">
        <Paper withBorder p="lg"><Text>Dashboard content</Text></Paper>
      </Box>
    ),
  },
} satisfies Meta<typeof ApplicationShellContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Loaded: Story = {
  name: "Visual · Connected / Loaded",
  tags: ["visual"],
}

export const Loading: Story = {
  name: "Visual · Initial Loading",
  tags: ["visual"],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
}

export const Failed: Story = {
  name: "Visual · Data Error",
  tags: ["visual"],
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          { request: { query: CurrentUserDocument }, error: new Error("User unavailable") },
          { request: { query: MyCommunitiesDocument }, error: new Error("Communities unavailable") },
        ]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
}
