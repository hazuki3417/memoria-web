import { PageWidth } from "@/components/PageWidth/PageWidth"
import { Dashboard } from "@/features/dashboard/Dashboard"

export default function Page() {
  return (
    <PageWidth variant="contained">
      <Dashboard />
    </PageWidth>
  )
}
