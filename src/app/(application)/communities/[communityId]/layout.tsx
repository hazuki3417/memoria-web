import { CommunitySettingsDataProvider } from "@/features/community-settings/CommunitySettingsDataProvider"

export default async function CommunityLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ communityId: string }> }>) {
  const { communityId } = await params
  return <CommunitySettingsDataProvider key={communityId} communityId={communityId}>{children}</CommunitySettingsDataProvider>
}
