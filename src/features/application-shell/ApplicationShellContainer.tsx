"use client"

import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core"
import { usePathname, useRouter } from "next/navigation"
import { type ReactNode, useEffect, useState } from "react"
import {
  MyCommunitiesDocument,
  useMyCommunitiesQuery,
  useCreateCommunityMutation,
} from "@/infrastructure/graphql/generated"
import { showNotification } from "@/components/Feedback"
import {
  ApplicationAccountMenu,
  ApplicationContentScroll,
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
} from "@/components/ApplicationShell"

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
  } = useMyCommunitiesQuery()
  const [createMutation] = useCreateCommunityMutation()
  const created =
    communityData?.myCommunities.map((item) => ({
      id: item.id,
      label: item.name,
      accentColor: item.mySettings.accentColor,
    })) ?? []
  const communitiesLoaded = !communitiesLoading && !!communityData
  const [createBusy, setCreateBusy] = useState(false)
  const [rememberedContextKind, setRememberedContextKind] = useState<
    "personal" | "community"
  >("personal")
  const [rememberedCommunityId, setRememberedCommunityId] = useState("")
  const communityMatch = pathname.match(/^\/communities\/([^/]+)/)
  const shellMode =
    pathname === "/settings/account/delete"
      ? "restricted-flow"
      : "authenticated"
  const isSettingsRoute = pathname.startsWith("/settings")
  const contextKind = communityMatch
    ? "community"
    : isSettingsRoute
      ? rememberedContextKind
      : "personal"
  const communityId = communityMatch?.[1] ?? rememberedCommunityId
  const currentCreated = created.find((item) => item.id === communityId)
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
      : personalContext
  const activeSection = getApplicationSection(pathname)
  const navigationItems = getApplicationNavigation({
    contextKind,
    activeSection,
  })

  useEffect(() => {
    const routeCommunityMatch = pathname.match(/^\/communities\/([^/]+)/)
    if (routeCommunityMatch) {
      setRememberedContextKind("community")
      setRememberedCommunityId(routeCommunityMatch[1])
    } else if (!pathname.startsWith("/settings")) {
      setRememberedContextKind("personal")
    }
  }, [pathname])

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
      <Modal
        opened={createOpened}
        onClose={closeCreate}
        title="Communityを作成"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Community名"
            required
            autoFocus
            value={draftName}
            onChange={(event) => {
              setDraftName(event.currentTarget.value)
              setCreateError("")
            }}
            error={createError || undefined}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                void createCommunity()
              }
            }}
          />
          <Text size="xs" c="dimmed">
            Communityを作成すると、メンバー管理と共有が利用できます。
          </Text>
          {communitiesError && (
            <Text size="xs" c="red">
              Community一覧を取得できませんでした。再読み込みしてお試しください。
            </Text>
          )}
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={closeCreate}
              disabled={createBusy}
            >
              キャンセル
            </Button>
            <Button
              disabled={!draftName.trim() || createBusy}
              loading={createBusy}
              onClick={() => void createCommunity()}
            >
              Communityを作成
            </Button>
          </Group>
        </Stack>
      </Modal>
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
                    personalContext,
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
                        `/communities/${encodeURIComponent(id)}/dashboard`,
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
                />
              ) : undefined
            }
            account={
              isApplicationShellFeatureVisible(shellMode, "account-menu") ? (
                <ApplicationAccountMenu
                  user={{ displayName: "ユーザー" }}
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
        <ApplicationContentScroll>{children}</ApplicationContentScroll>
      </ApplicationShell>
    </>
  )
}
