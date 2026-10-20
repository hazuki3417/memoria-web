/**
 * Deletion and subsequent discovery refresh are separate outcomes.
 *
 * A confirmed mutation success must remain successful even if the list
 * refresh fails. Apollo's listing query owns its own loading/error state.
 */
export async function deleteGroupThenRefresh({
  deleteGroup,
  onDeleted,
  refreshGroups,
}: {
  deleteGroup: () => Promise<void>
  onDeleted: () => void
  refreshGroups: () => Promise<unknown>
}): Promise<void> {
  await deleteGroup()
  onDeleted()
  void Promise.resolve()
    .then(refreshGroups)
    .catch(() => {
      // Refresh failures are surfaced by the discovery query, not the deletion.
    })
}
