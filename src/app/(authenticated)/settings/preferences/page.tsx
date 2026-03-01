"use client"
import { Toggle } from "@/components"
import { Divider, Stack } from "@mantine/core"
import { SettingSectionDivider } from "../_components/SettingSectionDivider/SettingSection"
import { SettingSectionTitle } from "../_components/SettingSectionTitle"

const Page = () => {
  return (
    <>
      <SettingSectionTitle>Preferences</SettingSectionTitle>
      <SettingSectionDivider />

      <Stack gap={"md"}>
        <Toggle
          label="Security campaign emails"
          description="Receive email notifications about security campaigns in repositories where you have access to security alerts."
          error="error"
          value={"react"}
          onChange={(event) => console.debug("debug", event.target.checked)}
        />
        <Divider />

        <Toggle
          label="Security campaign emails"
          description="Receive email notifications about security campaigns in repositories where you have access to security alerts."
          error="error"
          value={"svelte"}
          onChange={(event) => console.debug("debug", event.target.checked)}
        />
      </Stack>
    </>
  )
}

export default Page
