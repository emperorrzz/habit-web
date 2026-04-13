"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RegistrationForm } from "@/components/registration-form";
import { ProfileSetup } from "@/components/profile-setup";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

type Step = "registration" | "success" | "profile" | "complete";   // ← Добавили "complete"

export default function HomePage() {
  const [step, setStep] = useState<Step>("registration");
  const [displayName, setDisplayName] = useState<string>("");

  const handleRegistrationSubmit = (data: {
    username: string;
    display_name: string;
    email: string;
  }) => {
    console.log("✅ Регистрация прошла успешно:", data);
    setDisplayName(data.display_name);
    setStep("success");
  };

  const handleContinueToProfile = () => {
    setStep("profile");
  };

  // Обновили тип — только bio
  const handleProfileSubmit = (data: { bio: string }) => {
    console.log("👤 Профиль сохранён:", data);
    setStep("complete");        // Теперь работает без ошибки
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Header />

      <main className="flex-1 pt-16 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          {/* Шаг 1: Регистрация */}
          {step === "registration" && (
            <div className="grid lg:grid-cols-2 gap-12 items-center py-12">
              <div className="lg:order-1">
                <div className="max-w-md">
                  <h1 className="text-4xl font-bold text-zinc-900 leading-tight">
                    Формируй привычки <span className="text-violet-600">вместе</span>
                  </h1>
                  <p className="mt-4 text-lg text-zinc-600">
                    Найди партнёра по привычке и достигай целей быстрее.
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

              <div className="lg:order-2">
                <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm max-w-md mx-auto">
                  <h2 className="text-2xl font-bold text-center mb-2">Создать аккаунт</h2>
                  <p className="text-center text-zinc-500 mb-8">Начни свой путь уже сегодня</p>

                  <RegistrationForm onSuccess={handleRegistrationSubmit} />
                </div>
              </div>
            </div>
          )}

          {/* Шаг 2: Успех регистрации */}
          {step === "success" && (
            <div className="max-w-md mx-auto py-12">
              <div className="bg-white border border-zinc-200 rounded-3xl p-10 shadow-sm text-center">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-5xl mb-6">
                  🎉
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">Аккаунт создан!</h2>
                <p className="text-zinc-600 mb-8">
                  Добро пожаловать, <span className="font-medium">{displayName}</span>!<br />
                  Теперь давайте настроим ваш профиль.
                </p>

                <Button 
                  onClick={handleContinueToProfile} 
                  size="lg" 
                  className="w-full"
                >
                  Продолжить настройку профиля →
                </Button>
              </div>
            </div>
          )}

          {/* Шаг 3: Настройка профиля */}
          {step === "profile" && (
            <div className="max-w-md mx-auto py-12">
              <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center text-4xl mb-4">
                    👤
                  </div>
                  <h2 className="text-2xl font-bold">Настройте профиль</h2>
                  <p className="text-zinc-500 mt-2">
                    Это поможет найти подходящего партнёра
                  </p>
                </div>

                <ProfileSetup onSubmit={handleProfileSubmit} />
              </div>
            </div>
          )}

          {/* Шаг 4: Финальное поздравление */}
          {step === "complete" && (
            <div className="max-w-md mx-auto py-20">
              <div className="bg-white border border-zinc-200 rounded-3xl p-12 shadow-sm text-center">
                <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8">
                  <CheckCircle className="w-14 h-14 text-emerald-600" />
                </div>

                <h2 className="text-3xl font-bold text-zinc-900 mb-3">
                  Добро пожаловать в Habit!
                </h2>
                
                <p className="text-lg text-zinc-600 mb-10 leading-relaxed">
                  Ты успешно зарегистрировался и настроил профиль.<br />
                  Теперь можно начинать формировать привычки вместе с партнёром.
                </p>

                <div className="space-y-4">
                  <Button 
                    onClick={() => window.location.href = "/dashboard"} 
                    size="lg" 
                    className="w-full text-base font-medium"
                  >
                    Перейти в личный кабинет
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = "/habits"} 
                    size="lg" 
                    className="w-full"
                  >
                    Создать первую привычку
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}