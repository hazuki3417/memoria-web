"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type Dispatch, type SetStateAction } from "react"
import { getCommunityDetailsAction, getCommunityMembersAction } from "./actions"


export type CommunityMember = {
  id: string
  name: string
  role: "admin" | "member"
  isSelf?: boolean
}

type CommunityData = {
  communityId: string
  name: string | null
  members: CommunityMember[] | null
  loadError: boolean
  membersError: boolean
  setName: Dispatch<SetStateAction<string | null>>
  setMembers: Dispatch<SetStateAction<CommunityMember[] | null>>
}

const Context = createContext<CommunityData | null>(null)

export function CommunityProvider({ communityId, children }: { communityId: string; children: ReactNode }) {
  const [name, setName] = useState<string | null>(null)
  const [members, setMembers] = useState<CommunityMember[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [membersError, setMembersError] = useState(false)
  const requested = useRef(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    if (requested.current) return
    requested.current = true
    void getCommunityDetailsAction(communityId).then((result) => {
      if (!mounted.current) return
      if (result.kind === "loaded") setName(result.community.name)
      else setLoadError(true)
    }).catch(() => { if (mounted.current) setLoadError(true) })
    void getCommunityMembersAction(communityId).then((result) => {
      if (!mounted.current) return
      if (result.kind !== "loaded") {
        setMembersError(true)
        return
      }
      setMembers(result.members.map((member) => ({
        id: member.userId,
        name: member.nickname,
        role: member.role,
        isSelf: member.userId === result.currentUserId,
      })))
    }).catch(() => { if (mounted.current) setMembersError(true) })
  }, [communityId])

  return (
    <Context.Provider value={{ communityId, name, members, loadError, membersError, setName, setMembers }}>
      {children}
    </Context.Provider>
  )
}

export function useCommunity() {
  const data = useContext(Context)
  if (!data) throw new Error("CommunityProvider is required")
  return data
}
