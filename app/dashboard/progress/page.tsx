"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Target, TrendingUp, ArrowLeft } from "lucide-react";

type HabitStats = {
  id: string;
  title: string;
  current_streak: number;
  completionRate: number;     // % за последние 30 дней
};

export default function ProgressPage() {
  const [habits, setHabits] = useState<HabitStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      // 1. Получаем все активные привычки
      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("id, title")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (habitsError) throw habitsError;
      if (!habitsData || habitsData.length === 0) {
        setHabits([]);
        setLoading(false);
        return;
      }

      const habitIds = habitsData.map(h => h.id);

      // 2. Получаем стрихи (LEFT JOIN стиль)
      const { data: streaksData } = await supabase
        .from("streaks")
        .select("habit_id, current_streak")
        .in("habit_id", habitIds);

      // 3. Получаем количество отметок за последние 30 дней
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: checkinsData } = await supabase
        .from("habit_checkins")
        .select("habit_id")
        .in("habit_id", habitIds)
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

      // 4. Формируем статистику
      const stats: HabitStats[] = habitsData.map((habit) => {
        const streakObj = streaksData?.find(s => s.habit_id === habit.id);
        const completions = checkinsData?.filter(c => c.habit_id === habit.id).length || 0;
        const completionRate = Math.round((completions / 30) * 100);

        return {
          id: habit.id,
          title: habit.title,
          current_streak: streakObj?.current_streak || 0,
          completionRate: Math.min(completionRate, 100),
        };
      });

      setHabits(stats);
    } catch (err: any) {
      console.error("Ошибка загрузки прогресса:", err);
      setError("Не удалось загрузить статистику прогресса");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const totalStreak = habits.length > 0 
    ? Math.max(...habits.map(h => h.current_streak)) 
    : 0;

  const avgCompletion = habits.length > 0 
    ? Math.round(habits.reduce((sum, h) => sum + h.completionRate, 0) / habits.length) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-500">Загрузка прогресса...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">

      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-700 mb-2"
        >
        <ArrowLeft className="w-4 h-4" />
        Назад на дашборд
        </Link>
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-zinc-900">Прогресс и аналитика</h1>
          <p className="text-zinc-600 mt-2">Отслеживай свой рост и поддерживай мотивацию</p>
        </div>

        {/* Основные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Flame className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <p className="text-4xl font-bold">{totalStreak}</p>
                <p className="text-zinc-600">Максимальный стрик</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-4xl font-bold">{habits.length}</p>
                <p className="text-zinc-600">Активных привычек</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-4xl font-bold">{avgCompletion}%</p>
                <p className="text-zinc-600">Среднее выполнение</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Список привычек */}
        <Card>
          <CardHeader>
            <CardTitle>Статистика по привычкам</CardTitle>
          </CardHeader>
          <CardContent>
            {habits.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-zinc-500 text-lg">У вас пока нет активных привычек</p>
                <Button asChild className="mt-6">
                  <Link href="/dashboard/habits/new">Создать первую привычку</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {habits.map((habit) => (
                  <Link
                    key={habit.id}
                    href={`/dashboard/habits/${habit.id}`}
                    className="block group"
                  >
                    <div className="flex items-center justify-between p-6 rounded-2xl border border-zinc-200 hover:border-violet-300 hover:bg-zinc-50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">📅</div>
                        <div>
                          <p className="font-semibold text-xl group-hover:text-violet-600 transition-colors">
                            {habit.title}
                          </p>
                          <p className="text-sm text-zinc-500">
                            Стрик: {habit.current_streak} дней
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-bold text-emerald-600">
                          {habit.completionRate}%
                        </div>
                        <p className="text-xs text-zinc-500">за последние 30 дней</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}