import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/header"

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Header />
        {children}
      </div>
    </AuthGuard>
  )
}
