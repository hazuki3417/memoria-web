"use client"

import { SettingsInputValidationError, requireSettingsMutationOutcome } from "@/infrastructure/graphql/settingsMutationResult"
import { MyCommunitiesDocument, useUpdateCommunityMutation } from "@/infrastructure/graphql/generated"

/** Owns the Community name mutation, independent of member management. */
export function useCommunityNameAction(communityId: string) {
  const [updateCommunity] = useUpdateCommunityMutation()

  const onSaveName = async (nextName: string): Promise<string> => {
    const result = await updateCommunity({
      variables: { input: { communityId, name: nextName } },
      errorPolicy: "all",
      // The confirmed mutation must not be rejected by a later refresh failure.
      refetchQueries: [MyCommunitiesDocument],
      awaitRefetchQueries: false,
    })
    const outcome = requireSettingsMutationOutcome(result.data?.updateCommunity, result)
    if (outcome?.__typename === "InputValidationFailure")
      throw new SettingsInputValidationError(outcome.violations)
    if (outcome?.__typename !== "UpdateCommunitySuccess")
      throw new Error("Community name save unconfirmed")
    return outcome.community.name
  }

  return { onSaveName }
}
