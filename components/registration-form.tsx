"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";   // ← важно этот импорт

interface RegistrationFormProps {
  onSuccess?: (data: { username: string; display_name: string; email: string }) => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Валидация
    if (!username.trim() || !displayName.trim() || !email.trim() || !password.trim()) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }

    if (username.length < 3 || !/^[a-z0-9_]+$/.test(username.toLowerCase())) {
      setError("Username должен быть от 3 символов и содержать только буквы, цифры и _");
      return;
    }

    setIsLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            username: username.trim().toLowerCase(),
            display_name: displayName.trim(),
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered") || signUpError.message.includes("User already registered")) {
          setError("Пользователь с таким email уже существует");
        } else if (signUpError.message.toLowerCase().includes("username")) {
          setError("Этот username уже занят");
        } else {
          setError(signUpError.message);
        }
        return;
      }

      // Успех
      if (onSuccess) {
        onSuccess({
          username: username.trim().toLowerCase(),
          display_name: displayName.trim(),
          email: email.trim().toLowerCase(),
        });
      }
      
      // Можно очистить форму или перенаправить
      // router.push('/login') или что-то подобное

    } catch (err: any) {
      console.error(err);
      setError("Произошла неожиданная ошибка. Попробуйте ещё раз.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username">Username (уникальный)</Label>
        <Input
          id="username"
          type="text"
          placeholder="ivan_petrov"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Отображаемое имя</Label>
        <Input
          id="displayName"
          type="text"
          placeholder="Иван Петров"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="ivan@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          placeholder="Минимум 6 символов"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? "Создаём аккаунт..." : "Создать аккаунт"}
      </Button>

      <p className="text-xs text-center text-zinc-500">
        Нажимая кнопку, вы соглашаетесь с условиями использования
      </p>
    </form>
  );
}