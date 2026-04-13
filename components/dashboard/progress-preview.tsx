"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DayData {
  day: string
  completed: number
  total: number
}

interface ProgressPreviewProps {
  weekData: DayData[]
  streakDays: boolean[]
}

export function ProgressPreview({ weekData, streakDays }: ProgressPreviewProps) {
  const maxTotal = Math.max(...weekData.map((d) => d.total))

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Прогресс</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Выполнение за неделю
          </p>
          <div className="flex items-end justify-between gap-2 h-24">
            {weekData.map((day, index) => {
              const percentage = day.total > 0 ? (day.completed / day.total) * 100 : 0
              return (
                <div
                  key={index}
                  className="flex flex-col items-center gap-1 flex-1"
                >
                  <div className="w-full bg-secondary rounded-t h-20 relative">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-accent rounded-t transition-all"
                      style={{ height: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Стрик за последние 14 дней
          </p>
          <div className="flex gap-1 flex-wrap">
            {streakDays.map((completed, index) => (
              <div
                key={index}
                className={cn(
                  "w-6 h-6 rounded-sm",
                  completed ? "bg-accent" : "bg-secondary"
                )}
              />
            ))}
          </div>
        </div>

        <Link
          href="/dashboard/progress"
          className="inline-flex items-center text-sm font-medium text-foreground hover:text-accent transition-colors"
        >
          Посмотреть полный отчёт
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </CardContent>
    </Card>
  )
}
