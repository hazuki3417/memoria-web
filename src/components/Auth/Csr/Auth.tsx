import { useUserContext } from "@/providers"
import React from "react"

export interface AuthProps {
  children: React.ReactNode
}

export const Auth = (props: AuthProps) => {
  const { children } = props
  return <>{children}</>
}

Auth.SignedIn = ({ children }: { children: React.ReactNode }) => {
  const user = useUserContext()
  return user !== null ? <>{children}</> : null
}

Auth.SignedOut = ({ children }: { children: React.ReactNode }) => {
  const user = useUserContext()
  return user === null ? <>{children}</> : null
}
