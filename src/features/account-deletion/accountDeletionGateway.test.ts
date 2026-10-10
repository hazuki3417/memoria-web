import { describe, expect, it } from "vitest"
import { mockAccountDeletionGateway } from "./accountDeletionGateway"

describe("mock account deletion gateway", () => {
  it("requires a matching one-time review grant", async () => {
    const gateway = mockAccountDeletionGateway()
    const review = await gateway.createReview("plan-a")
    const result = await gateway.reauthenticate(review)
    expect(result.status).toBe("success")
    if (result.status !== "success") return
    await expect(gateway.confirm({ ...review, fingerprint: "changed" }, result.grant)).rejects.toThrow()
    await expect(gateway.confirm(review, result.grant)).resolves.toBeUndefined()
    await expect(gateway.confirm(review, result.grant)).rejects.toThrow()
  })
  it("rejects expired grants", async () => {
    const gateway = mockAccountDeletionGateway("expired")
    const review = await gateway.createReview("plan")
    const result = await gateway.reauthenticate(review)
    if (result.status !== "success") throw new Error("expected mock success")
    await expect(gateway.confirm(review, result.grant)).rejects.toThrow()
  })
  it.each(["failed", "cancelled"] as const)("exposes %s reauthentication", async (scenario) => {
    const gateway = mockAccountDeletionGateway(scenario)
    const review = await gateway.createReview("plan")
    expect((await gateway.reauthenticate(review)).status).toBe(scenario)
  })
})
