export type DeletionReview = { id: string; fingerprint: string }
export type DeletionGrant = { reviewId: string; expiresAt: number; nonce: string }
export type ReauthResult = { status: "success"; grant: DeletionGrant } | { status: "cancelled" | "failed" }
export interface AccountDeletionGateway {
  createReview(fingerprint: string): Promise<DeletionReview>
  reauthenticate(review: DeletionReview): Promise<ReauthResult>
  confirm(review: DeletionReview, grant: DeletionGrant): Promise<void>
}
export type MockScenario = "success" | "failed" | "cancelled" | "expired"
export function mockAccountDeletionGateway(scenario: MockScenario = "success", now: () => number = Date.now): AccountDeletionGateway {
  let serial = 0
  const reviews = new Map<string, { fingerprint: string; used: boolean; grant?: DeletionGrant }>()
  return {
    async createReview(fingerprint) {
      const id = String(++serial)
      reviews.set(id, { fingerprint, used: false })
      return { id, fingerprint }
    },
    async reauthenticate(review) {
      const state = reviews.get(review.id)
      if (!state || state.used || state.fingerprint !== review.fingerprint) return { status: "failed" }
      if (scenario === "failed" || scenario === "cancelled") return { status: scenario }
      const grant = { reviewId: review.id, expiresAt: now() + (scenario === "expired" ? -1 : 600000), nonce: String(serial++) }
      state.grant = grant
      return { status: "success", grant }
    },
    async confirm(review, grant) {
      const state = reviews.get(review.id)
      if (!state || state.used || state.fingerprint !== review.fingerprint ||
        state.grant !== grant || grant.reviewId !== review.id || now() >= grant.expiresAt) {
        throw new Error("再認証が無効です。再認証してください。")
      }
      state.used = true
      // Mock only: never delete account data.
    },
  }
}
export const unavailableAccountDeletionGateway: AccountDeletionGateway = {
  async createReview() { throw new Error("Backendに未接続です。") },
  async reauthenticate() { throw new Error("Auth0に未接続です。") },
  async confirm() { throw new Error("削除APIに未接続です。") },
}
