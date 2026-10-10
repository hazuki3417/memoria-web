import { AccountDeletionImpact } from "@/features/account-deletion/AccountDeletionImpact"

export default function Page() {
  return <AccountDeletionImpact mockScenario={process.env.NODE_ENV === "production" ? undefined : "success"} />
}
