import { ApplicationShellContainer } from "@/features/application-shell/ApplicationShellContainer"
import { Dashboard } from "@/features/dashboard/Dashboard"

export default async function Page({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params
  return <ApplicationShellContainer contextKind="community" communityId={communityId}><Dashboard contextKind="community" communityId={communityId} /></ApplicationShellContainer>
}
