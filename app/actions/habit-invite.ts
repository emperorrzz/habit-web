"use server";

import { createClient } from "@/utils/supabase/server";

type InviteResult = 
  | { success: true; message: string }
  | { success: false; message: string };

export async function processHabitInvite(habitId: string, invitationId: string): Promise<InviteResult> {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: "Необходимо авторизоваться" };
    }

    // Получаем приглашение + проверяем срок действия
    const { data: invite, error: inviteError } = await supabase
      .from("invitations")
      .select("id, status, sender_id, habit_id, expires_at")
      .eq("id", invitationId)
      .single();

    if (inviteError || !invite) {
      return { success: false, message: "Приглашение не найдено или недействительно" };
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return { success: false, message: "Срок действия приглашения истёк" };
    }

    if (inviteError || !invite) {
      return { success: false, message: "Приглашение не найдено или недействительно" };
    }

    if (invite.habit_id !== habitId) {
      return { success: false, message: "Приглашение не соответствует этой привычке" };
    }

    if (invite.sender_id === user.id) {
      return { success: false, message: "Нельзя принять собственное приглашение" };
    }

    if (invite.status === "accepted") {
      return { success: false, message: "Вы уже приняли это приглашение" };
    }

    if (invite.status !== "pending") {
      return { success: false, message: "Приглашение уже обработано" };
    }

    // Принимаем приглашение
    const { error: updateError } = await supabase
      .from("invitations")
      .update({ status: "accepted" })
      .eq("id", invitationId);

    if (updateError) throw updateError;

    // Создаём партнёрство (user_1_id всегда меньше user_2_id)
    const [user1, user2] = [invite.sender_id, user.id].sort();

    const { error: partnerError } = await supabase
      .from("partnerships")
      .insert({
        user_1_id: user1,
        user_2_id: user2,
        habit_id: habitId,
        is_active: true,
      });

    if (partnerError && partnerError.code !== "23505") {
      throw partnerError;
    }

    // revalidatePath("/dashboard/habits/" + habitId); // можно раскомментировать позже

    return { 
      success: true, 
      message: "Приглашение успешно принято! Теперь вы партнёры по привычке." 
    };

  } catch (err: any) {
    console.error("Ошибка обработки приглашения:", err);
    return { 
      success: false, 
      message: "Не удалось обработать приглашение. Попробуйте ещё раз." 
    };
  }
}