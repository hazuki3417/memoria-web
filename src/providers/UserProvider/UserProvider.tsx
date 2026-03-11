"use client"
import { UserContext } from "./UserContext"

export interface UserProviderProps {
  value: UserContext
  children: React.ReactNode
}

export const UserProvider = (props: UserProviderProps) => {
  const { value, children } = props
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
