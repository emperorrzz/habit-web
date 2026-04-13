import { Card, CardContent } from "@/components/ui/card";
import { Flame, Target, CheckCircle } from "lucide-react";

interface HeroSummaryProps {
  userName: string;
  activeHabits: number;
  completedToday: number;
  currentStreak: number;        // это будет максимальный стрик среди всех привычек
}

export function HeroSummary({
  userName,
  activeHabits,
  completedToday,
  currentStreak,
}: HeroSummaryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          Добро пожаловать, {userName}!
        </h1>
        <p className="text-xl text-zinc-600 mt-2">
          Сегодня ты на правильном пути 🔥
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Активные привычки */}
        <Card className="border-zinc-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-semibold text-zinc-900">{activeHabits}</p>
              <p className="text-sm text-zinc-500">Активных привычек</p>
            </div>
          </CardContent>
        </Card>

        {/* Выполнено сегодня */}
        <Card className="border-zinc-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-semibold text-zinc-900">{completedToday}</p>
              <p className="text-sm text-zinc-500">Выполнено сегодня</p>
            </div>
          </CardContent>
        </Card>

        {/* Лучший стрик (самое важное) */}
        <Card className="border-zinc-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-3xl font-semibold text-zinc-900">{currentStreak}</p>
              <p className="text-sm text-zinc-500">Дней в лучшем стрике</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}