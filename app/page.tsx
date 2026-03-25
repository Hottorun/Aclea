import { Dashboard } from "@/components/dashboard"
import { AuthGuard } from "@/components/auth-guard"

export default function Home() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  )
}
