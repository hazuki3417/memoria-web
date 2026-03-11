"use client"
import { useUserContext } from "@/providers"
import { useAppConfigContext } from "@/providers/AppConfigProvider"
import "client-only"

export const usePreference = () => {
  const user = useUserContext()
  const config = useAppConfigContext()

  return user?.preference ?? config.preference
}
