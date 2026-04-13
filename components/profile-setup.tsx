"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface ProfileSetupProps {
  onSubmit: (data: { bio: string }) => void;
}

export function ProfileSetup({ onSubmit }: ProfileSetupProps) {
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (bio.trim().length > 500) {
      setError("Био не должно превышать 500 символов");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("Не удалось получить данные пользователя");
        return;
      }

      // Сохраняем био в базу
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          bio: bio.trim() || null,
        })
        .eq("id", user.id);

      if (updateError) {
        console.error(updateError);
        setError("Не удалось сохранить данные. Попробуйте ещё раз.");
        return;
      }

      // ✅ Вызываем onSubmit из HomePage (это запустит переход на шаг "complete")
      onSubmit({ bio: bio.trim() });

    } catch (err: any) {
      console.error(err);
      setError("Произошла ошибка при сохранении профиля");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium">
          О себе
        </Label>
        <Textarea
          id="bio"
          placeholder="Расскажите немного о себе и каких привычек хотите придерживаться..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="min-h-[120px] resize-none"
          maxLength={500}
        />
        <p className="text-xs text-zinc-500 text-right">
          {bio.length}/500 символов
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button 
        type="submit" 
        className="w-full" 
        size="lg" 
        disabled={isLoading || !bio.trim()}
      >
        {isLoading ? "Сохраняем профиль..." : "Завершить регистрацию"}
      </Button>
    </form>
  );
}