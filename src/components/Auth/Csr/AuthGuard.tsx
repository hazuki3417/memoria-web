"use client"
import { authConfig } from "@/config/auth"
import { useAuth } from "@/hooks"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const AuthGuard = () => {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isSignIn) {
      router.push(authConfig.signedOut.redirect)
    }
  }, [auth.isSignIn])

  return null
}
