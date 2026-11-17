import { MockedProvider } from "@apollo/client/testing"
import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { expect, userEvent, within } from "storybook/test"
import { PersonalSettingsPreferencesDocument, PersonalSettingsProfileDocument, PersonalUsageDocument } from "@/infrastructure/graphql/generated"
import { SettingsSectionHost, type SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { graphqlUsageFixture } from "@/features/usage/usageStoryFixtures"
import { PersonalSettingsView } from "./PersonalSettingsView"
import type { PersonalSettingsSection } from "./personalSettingsSections"
import { Account } from "./account"
import { PersonalPreferences } from "./preferences"
import { defaultPersonalPreferences } from "./preferences/personalPreferences"
import { Profile } from "./profile"
import { PersonalUsage } from "./usage"

const profileMock = {
  request: { query: PersonalSettingsProfileDocument },
  result: { data: { me: { id: "user-a", profile: { nickname: "保存済みユーザー" } } } },
}
const preferencesMock = {
  request: { query: PersonalSettingsPreferencesDocument },
  result: { data: { me: { id: "user-a", preferences: defaultPersonalPreferences } } },
}
const usageMock = {
  request: { query: PersonalUsageDocument },
  result: { data: { me: { id: "user-a", preferences: { fileSizeUnit: "DECIMAL" }, usage: graphqlUsageFixture } } },
}

// Canvasだけが遷移先を保持し、本番のSection ControllerとHostを利用する。
const PersonalSettingsStory = () => {
  const [section, setSection] = useState<PersonalSettingsSection>("profile")
  const renderSection = (render: SettingsSectionRender) => {
    switch (section) {
      case "profile": return <Profile render={render} />
      case "preferences": return <PersonalPreferences render={render} />
      case "account": return render({ status: "ready", content: <Account /> })
      case "usage": return <PersonalUsage render={render} />
    }
  }
  return (
    <MockedProvider addTypename={false} mocks={[{ ...profileMock, maxUsageCount: 2 }, preferencesMock, usageMock]}>
      <PersonalSettingsView
        key={section}
        section={section}
        onSectionChange={setSection}
        personalAccentColor="#10B981"
        content={
          <SettingsSectionHost label="Personal設定を読み込み中">
            {renderSection}
          </SettingsSectionHost>
        }
      />
    </MockedProvider>
  )
}

const meta = {
  title: "features/personal-settings/PersonalSettingsView",
  component: PersonalSettingsStory,
} satisfies Meta<typeof PersonalSettingsStory>
export default meta
type Story = StoryObj<typeof meta>

export const SectionNavigation: Story = {
  name: "Interaction · Section切替と再取得・Draft破棄",
  tags: ["interaction"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nickname = await canvas.findByRole("textbox", { name: /ニックネーム/ })
    await expect(nickname).toHaveValue("保存済みユーザー")
    await userEvent.clear(nickname)
    await userEvent.type(nickname, "未保存の名前")
    const selectSection = async (label: string) => {
      const navigation = within(canvas.getByRole("navigation", { name: "設定" }))
      await userEvent.click(navigation.getByText(label))
    }
    await selectSection("環境設定")
    await expect(await canvas.findByRole("textbox", { name: "Personal Accent Color" })).toHaveValue("#10B981")
    await selectSection("利用状況")
    await expect(await canvas.findByRole("table")).toBeVisible()
    await selectSection("アカウント")
    await expect(canvas.getByRole("link", { name: "アカウントを削除する" })).toBeVisible()
    await selectSection("プロフィール")
    await expect(await canvas.findByRole("textbox", { name: /ニックネーム/ })).toHaveValue("保存済みユーザー")
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}
