"use client"
import { resolveUri } from "@/lib/url"
import { useUserContext } from "@/providers"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const AuthGuard = () => {
  const user = useUserContext()
  const router = useRouter()

  useEffect(() => {
    if (user === null) {
      router.push(resolveUri("/auth/login"))
    }
  }, [user])

  return null
}
