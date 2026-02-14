"use client"

import dynamic from "next/dynamic"

const Header = dynamic(
  () => import("@/components/header").then((m) => m.Header),
  { ssr: false }
)

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}
