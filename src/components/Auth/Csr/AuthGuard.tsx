"use client"
import { authConfig } from "@/config/auth"
import { useAuthContext } from "@/providers"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const AuthGuard = () => {
  const auth = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isSignIn) {
      router.push(authConfig.signedOut.redirect)
    }
  }, [auth.isSignIn])

  return null
}
