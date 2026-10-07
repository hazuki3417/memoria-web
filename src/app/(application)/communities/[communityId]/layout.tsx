import { ApplicationShellContainer } from "@/features/application-shell/ApplicationShellContainer"

export default async function CommunityLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ communityId: string }> }>) {
  const { communityId } = await params
  return <ApplicationShellContainer contextKind="community" communityId={communityId}>{children}</ApplicationShellContainer>
}
