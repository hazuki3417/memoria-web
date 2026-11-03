import { ApolloClient, ApolloLink, InMemoryCache, Observable } from "@apollo/client"
import { GraphQLError } from "graphql"
import { describe, expect, it } from "vitest"
import {
  SaveUserPreferencesDocument,
  UpdateMemoriaUserProfileDocument,
  UpdateCommunityDocument,
} from "@/infrastructure/graphql/generated"
import {
  SettingsInputValidationError,
  classifySettingsSaveFailure,
  requireSettingsMutationOutcome,
  resolveSettingsFailureValidation,
} from "./graphqlSettingsResult"

function clientFor(data: Record<string, unknown> | null, codes: string[] = []) {
  const link = new ApolloLink(
    () =>
      new Observable((observer) => {
        observer.next({
          data,
          errors: codes.map(
            (code) => new GraphQLError("not for display", { extensions: { code } }),
          ),
        })
        observer.complete()
      }),
  )
  return new ApolloClient({ cache: new InMemoryCache(), link })
}

describe("Settings Hybrid Result: Apollo partial-response integration", () => {
  it("keeps a typed Profile success authoritative even with unrelated GraphQL errors", async () => {
    const client = clientFor(
      {
        updateUserProfile: {
          __typename: "UpdateUserProfileSuccess",
          user: { __typename: "User", id: "user-1", profile: { nickname: "Updated" } },
        },
      },
      ["INTERNAL_SERVER_ERROR"],
    )
    const response = await client.mutate({
      mutation: UpdateMemoriaUserProfileDocument,
      variables: { input: { nickname: "Updated" } },
      errorPolicy: "all",
      fetchPolicy: "no-cache",
    })
    const outcome = requireSettingsMutationOutcome(response.data?.updateUserProfile, response)
    expect(outcome.__typename).toBe("UpdateUserProfileSuccess")
    if (outcome.__typename === "UpdateUserProfileSuccess")
      expect(outcome.user.profile.nickname).toBe("Updated")
    expect(response.errors).toHaveLength(1)
  })

  it("keeps typed InputValidationFailure as a rejected save with explicit FIELD paths", async () => {
    const client = clientFor(
      {
        updateUserPreferences: {
          __typename: "InputValidationFailure",
          violations: [
            {
              scope: "FIELD",
              code: "INVALID_FORMAT",
              inputPaths: [{ segments: ["personalAccentColor"] }],
            },
          ],
        },
      },
      ["INTERNAL_SERVER_ERROR"],
    )
    const response = await client.mutate({
      mutation: SaveUserPreferencesDocument,
      variables: { input: { personalAccentColor: "#123456" } },
      errorPolicy: "all",
      fetchPolicy: "no-cache",
    })
    const outcome = requireSettingsMutationOutcome(response.data?.updateUserPreferences, response)
    expect(outcome.__typename).toBe("InputValidationFailure")
    if (outcome.__typename !== "InputValidationFailure")
      throw new Error("Typed validation result missing")
    const failure = new SettingsInputValidationError(outcome.violations)
    expect(classifySettingsSaveFailure(failure)).toBe("validation")
    expect(resolveSettingsFailureValidation(failure, ["personalAccentColor"])).toEqual({
      fieldErrors: { personalAccentColor: "入力形式を確認してください。" },
      formError: false,
    })
  })

  it("classifies authorization errors without inventing an outcome from unrelated partial data", async () => {
    const client = clientFor({ unrelated: { ok: true } }, ["FORBIDDEN"])
    const response = await client.mutate({
      mutation: UpdateCommunityDocument,
      variables: { input: { communityId: "community-1", name: "New name" } },
      errorPolicy: "all",
      fetchPolicy: "no-cache",
    })
    expect(() =>
      requireSettingsMutationOutcome(response.data?.updateCommunity, response),
    ).toThrowError()
    try {
      requireSettingsMutationOutcome(response.data?.updateCommunity, response)
    } catch (error) {
      expect(classifySettingsSaveFailure(error)).toBe("blocked")
    }
  })

  it("treats a missing mutation result with internal errors as unknown, not retryable", async () => {
    const client = clientFor({ updateCommunity: null }, ["INTERNAL_SERVER_ERROR"])
    const response = await client.mutate({
      mutation: UpdateCommunityDocument,
      variables: { input: { communityId: "community-1", name: "New name" } },
      errorPolicy: "all",
      fetchPolicy: "no-cache",
    })
    try {
      requireSettingsMutationOutcome(response.data?.updateCommunity, response)
      throw new Error("Expected a missing-result failure")
    } catch (error) {
      expect(classifySettingsSaveFailure(error)).toBe("unknown")
    }
  })

  it("does not infer successful persistence from an empty successful transport result", async () => {
    const client = clientFor({})
    const response = await client.mutate({
      mutation: UpdateCommunityDocument,
      variables: { input: { communityId: "community-1", name: "New name" } },
      errorPolicy: "all",
      fetchPolicy: "no-cache",
    })
    expect(() => requireSettingsMutationOutcome(response.data?.updateCommunity, response)).toThrow(
      "Settings mutation outcome unavailable",
    )
  })
})
