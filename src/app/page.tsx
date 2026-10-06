import { ApplicationShellContainer } from "@/features/application-shell/ApplicationShellContainer"
import { Dashboard } from "@/features/dashboard/Dashboard"

export default function Home() {
  return (
    <ApplicationShellContainer>
      <Dashboard />
    </ApplicationShellContainer>
  )
}
