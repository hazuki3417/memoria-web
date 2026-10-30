"use client"

import { usePathname, useRouter } from "next/navigation"
import { type ReactNode, useRef, useState } from "react"
import {
  MyCommunitiesDocument,
  useCurrentUserQuery,
  useMyCommunitiesQuery,
  useCreateCommunityMutation,
} from "@/infrastructure/graphql/generated"
import { showNotification } from "@/components/Feedback"
import { MediaDetailUrlProvider } from "@/features/media-detail/MediaDetailUrlProvider"
import { MediaDetailUrlController } from "@/features/media-detail/MediaDetailUrlController"
import { getCommunityDisplayName, sortCommunitiesByDisplayName } from "./communityDisplayName"
import { CommunityCreateModal } from "./CommunityCreateModal/CommunityCreateModal"
import { useApplicationContextSelection } from "./useApplicationContextSelection"
import {
  ApplicationAccountMenu,
  ApplicationContextSwitcher,
  ApplicationHeader,
  ApplicationNavigation,
  ApplicationNavigationTrigger,
  ApplicationShell,
  getApplicationNavigation,
  getApplicationSection,
  getContextSwitchPath,
  isApplicationShellFeatureVisible,
  useApplicationNavigation,
} from "@/features/application-shell"

const personalContext = {
  id: "personal",
  kind: "personal" as const,
  label: "Personal",
  accentColor: "var(--mantine-color-blue-6)",
}

const communityContext = {
  id: "community",
  kind: "community" as const,
  label: "家族のアルバム",
  accentColor: "var(--mantine-color-teal-6)",
}

export function ApplicationShellContainer({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const navigation = useApplicationNavigation()
  const [createOpened, setCreateOpened] = useState(false)
  const [draftName, setDraftName] = useState("")
  const [createError, setCreateError] = useState("")
  const {
    data: communityData,
    loading: communitiesLoading,
    error: communitiesError,
    refetch: refetchCommunities,
  } = useMyCommunitiesQuery()
  const communityRefreshInFlight = useRef(false)
  const refreshCommunities = async () => {
    if (communityRefreshInFlight.current || (communitiesLoading && !communityData)) return
    communityRefreshInFlight.current = true
    try {
      await refetchCommunities()
    } catch {
      // useMyCommunitiesQueryのerrorをSwitcherが表示する。
    } finally {
      communityRefreshInFlight.current = false
    }
  }
  const { data: currentUserData, loading: currentUserLoading } =
    useCurrentUserQuery()
  const [createMutation] = useCreateCommunityMutation()
  const created =
    sortCommunitiesByDisplayName(communityData?.myCommunities.map((item) => ({
      id: item.id,
      label: getCommunityDisplayName(item),
      accentColor: item.mySettings.accentColor,
    })) ?? [])
  const communitiesLoaded = !communitiesLoading && !!communityData
  const [createBusy, setCreateBusy] = useState(false)
  const { contextKind, communityId, setRememberedContextKind, setRememberedCommunityId } =
    useApplicationContextSelection(pathname)
  const shellMode =
    pathname === "/settings/account/delete"
      ? "restricted-flow"
      : "authenticated"
  const currentCreated = created.find((item) => item.id === communityId)
  const resolvedPersonalContext = {
    ...personalContext,
    accentColor: currentUserData?.me?.preferences.personalAccentColor ?? personalContext.accentColor,
  }
  const currentContext =
    contextKind === "community"
      ? {
          ...communityContext,
          id: communityId,
          label:
            currentCreated?.label ??
            (communitiesLoaded ? "Community" : "読み込み中"),
          accentColor: currentCreated?.accentColor ?? communityContext.accentColor,
        }
      : resolvedPersonalContext
  const contextLoading =
    contextKind === "community" &&
    !currentCreated &&
    !communitiesLoaded &&
    !communitiesError
  const contextError =
    contextKind === "community" && !currentCreated && !!communitiesError
  const profileStatus = currentUserData?.me && !contextLoading && !contextError
    ? "ready"
    : (currentUserLoading && !currentUserData?.me) || contextLoading
      ? "loading"
      : "error"
  const activeSection = getApplicationSection(pathname)
  const navigationItems = getApplicationNavigation({
    contextKind,
    activeSection,
  })

  const closeCreate = () => {
    if (createBusy) return
    setCreateOpened(false)
    setDraftName("")
    setCreateError("")
  }
  const createCommunity = async () => {
    if (createBusy) return
    const name = draftName.trim()
    if (!name) {
      setCreateError("Community名を入力してください。")
      return
    }
    setCreateBusy(true)
    try {
      const result = await createMutation({
        variables: { input: { name } },
        refetchQueries: [MyCommunitiesDocument],
        awaitRefetchQueries: true,
      })
      const community = result.data?.createCommunity.community
      if (!community)
        throw new Error("Community creation did not return a Community")
      const { id, name: label } = community
      setRememberedContextKind("community")
      setRememberedCommunityId(id)
      setCreateOpened(false)
      setDraftName("")
      setCreateError("")
      showNotification({
        kind: "success",
        title: "Communityを作成",
        description: `${label}を作成しました。`,
      })
      router.push(`/communities/${encodeURIComponent(id)}/dashboard`)
    } catch {
      setCreateError("Communityを作成できませんでした。再度お試しください。")
    } finally {
      setCreateBusy(false)
    }
  }

  const selectNavigation = (itemId: string) => {
    const prefix =
      contextKind === "community" ? `/communities/${communityId}` : ""
    router.push(
      itemId === "dashboard"
        ? prefix
          ? `${prefix}/dashboard`
          : "/dashboard"
        : `${prefix}/${itemId}`,
    )
    navigation.close()
  }

  return (
    <>
      <CommunityCreateModal
        opened={createOpened}
        onClose={closeCreate}
        name={draftName}
        onNameChange={setDraftName}
        error={createError}
        onErrorClear={() => setCreateError("")}
        busy={createBusy}
        communitiesError={Boolean(communitiesError)}
        onCreate={() => void createCommunity()}
      />
      <ApplicationShell
        header={
          <ApplicationHeader
            accentColor={currentContext.accentColor}
            onTitleClick={() => {
              router.push(
                contextKind === "community" && communityId
                  ? `/communities/${encodeURIComponent(communityId)}/dashboard`
                  : "/dashboard",
              )
              navigation.close()
            }}
            reserveNavigationSpace={shellMode === "restricted-flow"}
            leading={
              isApplicationShellFeatureVisible(shellMode, "navigation") ? (
                <ApplicationNavigationTrigger
                  opened={navigation.opened}
                  onToggle={navigation.toggle}
                />
              ) : undefined
            }
            context={
              isApplicationShellFeatureVisible(
                shellMode,
                "context-switcher",
              ) ? (
                <ApplicationContextSwitcher
                  currentContext={currentContext}
                  contexts={[
                    resolvedPersonalContext,
                    ...created.map((item) => ({
                      ...communityContext,
                      id: item.id,
                      label: item.label,
                      accentColor: item.accentColor,
                    })),
                  ]}
                  onSelect={(id) => {
                    if (id !== "personal") {
                      router.push(
                        getContextSwitchPath({
                          currentPathname: pathname,
                          targetContextKind: "community",
                          communityId: encodeURIComponent(id),
                        }),
                      )
                      navigation.close()
                      return
                    }
                    router.push(
                      getContextSwitchPath({
                        currentPathname: pathname,
                        targetContextKind:
                          id === "personal" ? "personal" : "community",
                        communityId,
                      }),
                    )
                    navigation.close()
                  }}
                  onCreateCommunity={() => setCreateOpened(true)}
                  onOpen={() => void refreshCommunities()}
                  onRetry={() => void refreshCommunities()}
                  loading={communitiesLoading}
                  error={Boolean(communitiesError)}
                />
              ) : undefined
            }
            account={
              isApplicationShellFeatureVisible(shellMode, "account-menu") ? (
                <ApplicationAccountMenu
                  user={{
                    displayName: currentUserData?.me?.profile.nickname ?? "",
                  }}
                  profileStatus={profileStatus}
                  currentContext={currentContext}
                  onOpenSettings={() => router.push("/settings/profile")}
                  onLogout={() => {
                    window.location.assign("/auth/logout")
                  }}
                />
              ) : undefined
            }
          />
        }
        navigation={
          isApplicationShellFeatureVisible(shellMode, "navigation") ? (
            <ApplicationNavigation
              opened={navigation.opened}
              onClose={navigation.close}
              items={navigationItems}
              accentColor={currentContext.accentColor}
              onSelect={selectNavigation}
            />
          ) : undefined
        }
      >
        <MediaDetailUrlProvider>
          {children}
          {contextKind === "community" && communityId ? (
            <MediaDetailUrlController scope={{ type: "COMMUNITY", communityId }} />
          ) : contextKind === "personal" ? (
            <MediaDetailUrlController scope={{ type: "PERSONAL" }} />
          ) : null}
        </MediaDetailUrlProvider>
      </ApplicationShell>
    </>
  )
}
