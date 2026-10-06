import { Dashboard } from "@/features/dashboard/Dashboard"

export default async function Page({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params
  return <Dashboard contextKind="community" communityId={communityId} />
}
