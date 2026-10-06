import { ApplicationShellContainer } from "@/features/application-shell/ApplicationShellContainer"

export default function PersonalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ApplicationShellContainer>{children}</ApplicationShellContainer>
}
