import { PageWidth } from "@/components/PageWidth/PageWidth"
import { Dashboard } from "@/features/dashboard/Dashboard"

export default async function Page({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params
  return <PageWidth variant="contained"><Dashboard contextKind="community" communityId={communityId} /></PageWidth>
}
