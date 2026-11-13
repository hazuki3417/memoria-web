"use client"

import type { SettingsSectionRender } from "@/ui/SettingsSectionHost"
import { usePersonalPreferencesConnection } from "./usePersonalPreferencesConnection"
import { usePersonalPreferencesForm } from "./usePersonalPreferencesForm"
import { defaultUserPreferences, type UserPreferences, type UserPreferencesPatch } from "./userPreferences"
import { PersonalPreferencesView } from "./PersonalPreferencesView"
import type { SavePersonalPreferencesAction } from "./personalPreferencesSaveOutcome"

type PreferencesProps = {
  /** SettingsSectionHostを使う実運用の入口。Storyでは指定しない。 */
  render?: SettingsSectionRender
  compact?: boolean
  initialPreferences?: UserPreferences
  onSave?: (patch: UserPreferencesPatch) => Promise<UserPreferences>
  onSaveAction?: SavePersonalPreferencesAction
  onInspect?: () => Promise<UserPreferences>
}

/**
 * Preferencesの唯一の公開入口。実運用のQuery/Mutation接続と、
 * Storybookの注入Fixtureを明確に分離する。
 */
export function PersonalPreferences(props: PreferencesProps) {
  if (props.render) return <ConnectedPreferences render={props.render} />
  return <PreferencesReady {...props} />
}

/** 実運用だけがApollo依存Hookを使用し、Loading/ErrorではFormを起動しない。 */
function ConnectedPreferences({ render }: { render: SettingsSectionRender }) {
  const connection = usePersonalPreferencesConnection()

  if (!connection.initialPreferences) {
    return render(
      connection.loading
        ? { status: "loading" }
        : { status: "error", retry: connection.retry },
    )
  }

  return render({
    status: "ready",
    content: (
      <PreferencesReady
        compact={connection.compact}
        initialPreferences={connection.initialPreferences}
        onSaveAction={connection.savePreferencesAction}
        onInspect={connection.inspectPreferences}
      />
    ),
  })
}

/** 共有FormとQueueはReady画面のLifetimeだけに存在する。 */
function PreferencesReady({
  compact = false,
  initialPreferences = defaultUserPreferences,
  onSave,
  onSaveAction,
  onInspect,
}: Omit<PreferencesProps, "render">) {
  const model = usePersonalPreferencesForm(initialPreferences, onSave, onInspect, onSaveAction)
  return (
    <PersonalPreferencesView
      compact={compact}
      model={model}
      canSave={Boolean(onSave || onSaveAction)}
    />
  )
}
