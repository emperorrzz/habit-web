import Link from "next/link"
import { Button } from "@/components/ui/button"

export function QuickActions() {
  return (
    <section className="flex flex-col sm:flex-row gap-3">
      <Button asChild className="flex-1">
        <Link href="/dashboard/habits/new">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Создать новую привычку
        </Link>
      </Button>
    </section>
  )
}
