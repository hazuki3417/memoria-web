import { redirect } from "next/navigation"
import { Settings } from "@/features/settings"
import { getCurrentMemoriaUser } from "@/infrastructure/graphql"
import { updateProfileAction } from "./actions"

export default async function Page() {
  const currentUser = await getCurrentMemoriaUser()
  if (currentUser.kind === "unregistered") redirect("/register")
  if (currentUser.kind === "unavailable") redirect("/auth/unavailable")
  if (currentUser.kind === "error") redirect("/auth/error")
  return (
    <Settings
      section="profile"
      profileNickname={currentUser.user.profile.nickname}
      saveProfile={async (nickname) => {
        "use server"
        const result = await updateProfileAction(nickname)
        if (result === "updated") return
        if (result === "blocked") throw Object.assign(new Error("Profile update blocked"), { kind: "blocked" })
        throw new Error("Profile update failed")
      }}
    />
  )
}
