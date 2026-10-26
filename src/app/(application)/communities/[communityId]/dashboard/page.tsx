import { PageWidth } from "@/components/PageWidth/PageWidth"
import { DashboardContainer } from "@/features/dashboard/DashboardContainer"

export default async function Page({
  params,
}: {
  params: Promise<{ communityId: string }>
}) {
  const { communityId } = await params
  return (
    <PageWidth variant="contained">
      <DashboardContainer contextKind="community" communityId={communityId} />
    </PageWidth>
  )
}
