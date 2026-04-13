"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Flame, CheckCircle } from "lucide-react";

interface Habit {
  id: string;
  title: string;
  current_streak: number;
  completedToday: boolean;
}

interface HabitListProps {
  habits: Habit[];
  onMarkComplete: (habitId: string) => void;
}

export function HabitList({ habits, onMarkComplete }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">У тебя пока нет активных привычек</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900">Мои привычки</h2>

      <div className="space-y-3">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onMarkComplete={onMarkComplete}
          />
        ))}
      </div>
    </section>
  );
}

function HabitCard({
  habit,
  onMarkComplete,
}: {
  habit: Habit;
  onMarkComplete: (habitId: string) => void;
}) {
  const [isCompleted, setIsCompleted] = useState(habit.completedToday);

  const handleComplete = () => {
    setIsCompleted(true);
    onMarkComplete(habit.id);
  };

  const getEmoji = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("пробежка") || lower.includes("спорт") || lower.includes("трени")) return "🏃‍♂️";
    if (lower.includes("чтение") || lower.includes("книга")) return "📖";
    if (lower.includes("медитац")) return "🧘";
    if (lower.includes("английск") || lower.includes("язык")) return "🇬🇧";
    if (lower.includes("вода") || lower.includes("пить")) return "💧";
    return "⭐";
  };

  return (
    <Card className="border-zinc-200 hover:shadow-sm transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          {/* Левая часть */}
          <Link
            href={`/dashboard/habits/${habit.id}`}
            className="flex items-center gap-4 flex-1 min-w-0 group"
          >
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 transition-colors",
                isCompleted ? "bg-emerald-100" : "bg-zinc-100"
              )}
            >
              {getEmoji(habit.title)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium text-lg text-zinc-900 truncate group-hover:text-violet-600 transition-colors">
                {habit.title}
              </p>
              <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Стрик: <span className="font-medium text-orange-600">{habit.current_streak}</span> дней</span>
              </div>
            </div>
          </Link>

          {/* Правая часть */}
          <div className="flex flex-col items-end gap-2">
            <Button
              variant={isCompleted ? "secondary" : "default"}
              size="sm"
              onClick={handleComplete}
              disabled={isCompleted}
              className="min-w-[120px]"
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Выполнено
                </>
              ) : (
                "Отметить сегодня"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}