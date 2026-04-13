"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { processHabitInvite } from "@/app/actions/habit-invite";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Flame, Edit, Trash2, UserPlus, Copy, Check, Users } from "lucide-react";

type HabitDetail = {
  id: string;
  title: string;
  description: string | null;
  frequency: "daily" | "weekly";
  is_active: boolean;
  current_streak: number;
  longest_streak: number;
  partner_id?: string | null;
  partner_name?: string | null;
  partner_username?: string | null;
};

export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const habitId = params.id as string;

  const [habit, setHabit] = useState<HabitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Новые состояния для кнопки отметки
  const [isMarking, setIsMarking] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);

  const [inviteResult, setInviteResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFrequency, setEditFrequency] = useState<"daily" | "weekly">("daily");

  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  // ==================== ЗАГРУЗКА ПРИВЫЧКИ ====================
  const fetchHabit = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Не авторизован");

      const { data: habitData } = await supabase
        .from("habits")
        .select("id, title, description, frequency, is_active")
        .eq("id", habitId)
        .maybeSingle();

      if (!habitData) throw new Error("Привычка не найдена");

      // Проверяем, отмечена ли привычка сегодня
      const today = new Date().toISOString().split("T")[0];
      const { data: checkin } = await supabase
        .from("habit_checkins")
        .select("id")
        .eq("habit_id", habitId)
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();

      setCompletedToday(!!checkin);

      // Получаем информацию о партнёре
      const { data: partnerships } = await supabase
        .from("partnerships")
        .select("user_1_id, user_2_id")
        .eq("habit_id", habitId)
        .eq("is_active", true);

      let partnerInfo = null;
      if (partnerships && partnerships.length > 0) {
        const p = partnerships[0];
        const partnerId = p.user_1_id === user.id ? p.user_2_id : p.user_1_id;

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, username")
          .eq("id", partnerId)
          .single();

        if (profile) {
          partnerInfo = {
            id: partnerId,
            name: profile.display_name || profile.username || "Партнёр",
            username: profile.username || "",
          };
        }
      }

      setHabit({
        id: habitData.id,
        title: habitData.title,
        description: habitData.description,
        frequency: habitData.frequency,
        is_active: habitData.is_active,
        current_streak: 0,        // можно улучшить позже
        longest_streak: 0,
        partner_id: partnerInfo?.id || null,
        partner_name: partnerInfo?.name || null,
        partner_username: partnerInfo?.username || null,
      });

    } catch (err: any) {
      console.error("❌ fetchHabit error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== ОБРАБОТКА ПРИГЛАШЕНИЯ ====================
  useEffect(() => {
    const invitationId = searchParams.get("invite");
    if (!invitationId) return;

    const handleInvite = async () => {
      const result = await processHabitInvite(habitId, invitationId);

      if (result.success) {
        setInviteResult({ type: "success", message: result.message });
        router.replace(`/dashboard/habits/${habitId}`);
      } else {
        setInviteResult({ type: "error", message: result.message });
      }

      await new Promise(r => setTimeout(r, 800));
      await fetchHabit();
    };

    handleInvite();
  }, [habitId, searchParams, router]);

  useEffect(() => {
    fetchHabit();
  }, [habitId]);

  // ==================== ОТМЕТИТЬ ВЫПОЛНЕНИЕ ====================
  const markAsCompleted = async () => {
    if (!habit || isMarking || completedToday) return;

    setIsMarking(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Не авторизован");

      const today = new Date().toISOString().split("T")[0];

      const { error } = await supabase
        .from("habit_checkins")
        .insert({
          user_id: user.id,
          habit_id: habit.id,
          date: today,
        });

      if (error) throw error;

      setCompletedToday(true);
      // Локально увеличиваем стрик
      setHabit(prev => prev ? { ...prev, current_streak: prev.current_streak + 1 } : null);

    } catch (err: any) {
      console.error(err);
      alert("Не удалось отметить привычку. Попробуйте ещё раз.");
    } finally {
      setIsMarking(false);
    }
  };

  // ==================== ПРИГЛАШЕНИЕ ====================
  const generateInviteLink = async () => {
    if (!habit) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Не авторизован");

    const { data: newInvite, error } = await supabase
      .from("invitations")
      .insert({ sender_id: user.id, receiver_id: null, habit_id: habit.id, status: "pending" })
      .select()
      .single();

    if (error || !newInvite) {
      alert("Не удалось создать приглашение");
      return;
    }

    const link = `${window.location.origin}/dashboard/habits/${habit.id}?invite=${newInvite.id}`;
    setInviteLink(link);
    setIsInviteOpen(true);
  };

  const copyInviteLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ==================== РЕДАКТИРОВАНИЕ И УДАЛЕНИЕ ====================
  const openEditModal = () => {
    if (!habit) return;
    setEditTitle(habit.title);
    setEditDescription(habit.description || "");
    setEditFrequency(habit.frequency);
    setIsEditOpen(true);
  };

  const saveEdit = async () => {
    if (!habit) return;
    const { error } = await supabase
      .from("habits")
      .update({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        frequency: editFrequency,
      })
      .eq("id", habit.id);

    if (error) alert("Ошибка сохранения");
    else {
      setIsEditOpen(false);
      fetchHabit();
    }
  };

  const deleteHabit = async () => {
    if (!habit) return;
    const { error } = await supabase.from("habits").delete().eq("id", habit.id);
    if (error) alert("Не удалось удалить");
    else router.push("/dashboard");
  };

  if (loading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center">Загрузка...</div>;

  if (error || !habit) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 text-center">
        <p className="text-red-500">{error || "Привычка не найдена"}</p>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button>Вернуться к списку</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-700 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Все привычки</span>
        </Link>

        {inviteResult && (
          <div className={`mb-6 p-4 rounded-lg ${
            inviteResult.type === "success" 
              ? "bg-green-50 border border-green-200 text-green-800" 
              : "bg-red-50 border border-red-200 text-red-800"
          }`}>
            <p>{inviteResult.message}</p>
          </div>
        )}

        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold">{habit.title}</h1>
                <p className="text-zinc-500 mt-2">
                  {habit.frequency === "daily" ? "Ежедневная" : "Еженедельная"} привычка
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={openEditModal}>
                  <Edit className="w-4 h-4 mr-2" /> Редактировать
                </Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setIsDeleteOpen(true)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Удалить
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-10">
            {/* Блок партнёра */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6">
              {habit.partner_id ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback>{habit.partner_name?.[0]?.toUpperCase() || "P"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-blue-600">Партнёр</p>
                      <p className="text-xl font-semibold">{habit.partner_name}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Активный</Badge>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-blue-800 font-medium mb-2">Нет партнёра</p>
                  <Button onClick={generateInviteLink} className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="mr-2 w-4 h-4" />
                    Пригласить партнёра
                  </Button>
                </div>
              )}
            </div>

            {/* Стрики */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-orange-50 border border-orange-100 rounded-3xl p-8 text-center">
                <Flame className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <p className="text-5xl font-bold text-orange-600">{habit.current_streak}</p>
                <p className="text-orange-700">текущий стрик</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 text-center">
                <Flame className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <p className="text-5xl font-bold text-amber-600">{habit.longest_streak}</p>
                <p className="text-amber-700">лучший стрик</p>
              </div>
            </div>

            {habit.description && (
              <div className="bg-zinc-50 rounded-3xl p-8">
                <h3 className="font-semibold mb-3">Описание</h3>
                <p className="text-zinc-700">{habit.description}</p>
              </div>
            )}

            {/* Рабочая кнопка отметки */}
            <Button 
              onClick={markAsCompleted}
              disabled={isMarking || completedToday}
              size="lg" 
              className="w-full h-16 text-xl rounded-3xl"
            >
              {isMarking 
                ? "Отмечаем..." 
                : completedToday 
                ? "✓ Уже отмечено сегодня" 
                : "✅ Отметить выполнение сегодня"}
            </Button>
          </CardContent>
        </Card>

        {/* Модалки */}
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Пригласить партнёра</DialogTitle>
              <DialogDescription>Отправьте ссылку другу</DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly />
              <Button onClick={copyInviteLink}>{copied ? <Check /> : <Copy />}</Button>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsInviteOpen(false)}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Редактировать привычку</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Название</Label>
                <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} />
              </div>
              <div>
                <Label>Частота</Label>
                <Select value={editFrequency} onValueChange={v => setEditFrequency(v as "daily" | "weekly")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Ежедневно</SelectItem>
                    <SelectItem value="weekly">Еженедельно</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Отмена</Button>
              <Button onClick={saveEdit}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Удалить привычку?</AlertDialogTitle>
              <AlertDialogDescription>Действие нельзя отменить.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={deleteHabit} className="bg-red-600">Удалить</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}