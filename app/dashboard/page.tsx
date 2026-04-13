"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { DashboardHeader } from "@/components/dashboard-header";
import { Footer } from "@/components/footer";

import { HeroSummary } from "@/components/dashboard/hero-summary";
import { HabitList } from "@/components/dashboard/habit-list";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { PartnerActivity } from "@/components/dashboard/partner-activity";

type Habit = {
  id: string;
  title: string;
  current_streak: number;
  completedToday: boolean;
};

type PartnerInfo = {
  id: string;
  display_name: string;
  streak: number;
  lastAction?: string;
} | null;

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [partner, setPartner] = useState<PartnerInfo>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Не авторизован");

      // 1. Имя пользователя
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      setUserName(profile?.display_name || user.email?.split("@")[0] || "Пользователь");

      // 2. Получаем все доступные привычки (свои + партнёрские)
      const { data: habitsData } = await supabase
        .from("habits")
        .select("id, title, is_active")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      let formattedHabits: Habit[] = [];
      let bestStreak = 0;

      if (habitsData && habitsData.length > 0) {
        const habitIds = habitsData.map(h => h.id);

        // Стрики для всех привычек
        const { data: streaksData } = await supabase
          .from("streaks")
          .select("habit_id, current_streak")
          .in("habit_id", habitIds);

        // Отметки за сегодня (только свои)
        const today = new Date().toISOString().split("T")[0];
        const { data: checkins } = await supabase
          .from("habit_checkins")
          .select("habit_id")
          .eq("user_id", user.id)
          .eq("date", today);

        const completedIds = new Set(checkins?.map(c => c.habit_id) || []);

        formattedHabits = habitsData.map((habit) => {
          const streak = streaksData?.find(s => s.habit_id === habit.id);
          return {
            id: habit.id,
            title: habit.title,
            current_streak: streak?.current_streak || 0,
            completedToday: completedIds.has(habit.id),
          };
        });

        // Лучший стрик среди всех привычек
        bestStreak = Math.max(...(streaksData?.map(s => s.current_streak) || [0]), 0);
      }

      setHabits(formattedHabits);

      // 3. Активное партнёрство + стрик партнёра
      const { data: partnership } = await supabase
        .from("partnerships")
        .select("user_1_id, user_2_id, habit_id")
        .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
        .eq("is_active", true)
        .limit(1)
        .single();

      if (partnership) {
        const partnerId = partnership.user_1_id === user.id 
          ? partnership.user_2_id 
          : partnership.user_1_id;

        const { data: partnerProfile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", partnerId)
          .single();

        // Стрик партнёра
        const { data: partnerStreak } = await supabase
          .from("streaks")
          .select("current_streak")
          .eq("user_id", partnerId)
          .eq("habit_id", partnership.habit_id)
          .single();

        // Последняя активность партнёра
        const { data: lastCheckin } = await supabase
          .from("habit_checkins")
          .select("created_at")
          .eq("user_id", partnerId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        setPartner({
          id: partnerId,
          display_name: partnerProfile?.display_name || "Партнёр",
          streak: partnerStreak?.current_streak || 0,
          lastAction: lastCheckin 
            ? `Отметил сегодня в ${new Date(lastCheckin.created_at).toLocaleTimeString("ru-RU", { 
                hour: "2-digit", 
                minute: "2-digit" 
              })}`
            : "Ещё не отмечал сегодня",
        });
      } else {
        setPartner(null);
      }

    } catch (err: any) {
      console.error("Dashboard error:", err);
      setError(err.message || "Ошибка загрузки дашборда");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleMarkComplete = async (habitId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];

      const { error } = await supabase
        .from("habit_checkins")
        .insert({ user_id: user.id, habit_id: habitId, date: today });

      if (error) throw error;

      // Обновляем локально
      setHabits(prev =>
        prev.map(h =>
          h.id === habitId
            ? { ...h, completedToday: true, current_streak: h.current_streak + 1 }
            : h
        )
      );
    } catch (err) {
      console.error(err);
      alert("Не удалось отметить привычку");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-500">Загрузка дашборда...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <DashboardHeader />

      <main className="pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="space-y-10">
            <HeroSummary
              userName={userName}
              activeHabits={habits.length}
              completedToday={habits.filter((h) => h.completedToday).length}
              currentStreak={Math.max(...habits.map((h) => h.current_streak), 0)}
            />

            <QuickActions />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <HabitList
                  habits={habits}
                  onMarkComplete={handleMarkComplete}
                />
              </div>

              <div className="lg:col-span-2">
                <PartnerActivity partner={partner} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}