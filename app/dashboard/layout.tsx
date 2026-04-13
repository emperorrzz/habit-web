import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - Habit",
  description: "Управляйте своими привычками и следите за прогрессом",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
