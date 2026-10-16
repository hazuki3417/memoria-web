import { redirect } from "next/navigation"
import { Settings } from "@/features/settings/Settings"
import { getCurrentMemoriaUser } from "@/infrastructure/graphql"
import { updatePreferencesAction } from "./actions"

export default async function Page() {
  const current = await getCurrentMemoriaUser()
  if (current.kind === "unregistered") redirect("/register")
  if (current.kind === "unavailable") redirect("/auth/unavailable")
  if (current.kind === "error") redirect("/auth/error")

  return (
    <Settings
      section="preferences"
      initialPreferences={current.user.preferences}
      savePreferences={async (patch) => {
        "use server"
        const result = await updatePreferencesAction(patch)
        if (result.kind === "updated") return result.preferences
        if (result.kind === "blocked")
          throw Object.assign(new Error("Preferences update blocked"), { kind: "blocked" })
        throw new Error("Preferences update failed")
      }}
    />
  )
}
