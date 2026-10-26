"use client"

import { useState } from "react"
import { AccountRegistration, type AccountRegistrationReviewState } from "@/features/account-registration"

/** Storybook固有の操作Adapter。画面表示は本体と同じComponentを使用する。 */
export function AccountRegistrationPrototype({
  reviewState = "default",
}: {
  reviewState?: AccountRegistrationReviewState
}) {
  const [fixtureExited, setFixtureExited] = useState(false)
  // 元のPrototypeと同じく外部Navigationは実行しない。
  // 終了後のUI状態は共通画面内で保持するため、Fixtureは副作用を持たない。
  void fixtureExited
  return (
    <AccountRegistration
      reviewState={reviewState}
      onRegister={async () => "success"}
      onRegisterSuccess={() => {
        // 本体と異なりPrototypeではSuccessを画面内で確認できる。
        // Feedbackの描画は共通UIが担当する。
      }}
      onExit={() => setFixtureExited(true)}
    />
  )
}
