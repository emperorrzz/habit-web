"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Неверный email или пароль");
        } else {
          setError(signInError.message);
        }
        return;
      }

      // Успешный вход
      router.push("/dashboard"); // или куда тебе нужно после логина
      router.refresh(); // обновляем сессию

    } catch (err: any) {
      console.error(err);
      setError("Произошла ошибка при входе. Попробуйте ещё раз.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Header />

      <main className="flex-1 pt-16 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-12">
            
            {/* Левая колонка — информация (такая же как на регистрации) */}
            <div className="lg:order-1">
              <div className="max-w-md">
                <h1 className="text-4xl font-bold text-zinc-900 leading-tight">
                  Добро пожаловать обратно
                </h1>
                <p className="mt-4 text-lg text-zinc-600">
                  Продолжай формировать привычки вместе с партнёром.
                </p>

                <div className="mt-10 space-y-6">
                  <div className="flex gap-4">
                    <div className="text-3xl">👥</div>
                    <div>
                      <h3 className="font-semibold">Партнёр по привычке</h3>
                      <p className="text-sm text-zinc-500">Мотивация каждый день</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-3xl">📈</div>
                    <div>
                      <h3 className="font-semibold">Совместный прогресс</h3>
                      <p className="text-sm text-zinc-500">Стрики и поддержка</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка — форма логина */}
            <div className="lg:order-2">
              <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-center mb-2">Войти в аккаунт</h2>
                <p className="text-center text-zinc-500 mb-8">Рады видеть вас снова</p>

                <form onSubmit={handleSubmit} className="space-y-5">
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
                      placeholder="Ваш пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Входим..." : "Войти"}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <p className="text-zinc-600">
                    Нет аккаунта?{" "}
                    <Link 
                      href="/"
                      className="text-violet-600 hover:text-violet-700 font-medium"
                    >
                      Создать аккаунт
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}