import { CommunityProvider } from "@/features/community/CommunityProvider"

export default async function CommunityLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ communityId: string }>
}>) {
  const { communityId } = await params
  return (
    <CommunityProvider key={communityId} communityId={communityId}>
      {children}
    </CommunityProvider>
  )
}
