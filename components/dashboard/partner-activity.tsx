import Link from "next/link";

interface PartnerProps {
  partner: {
    id: string;
    display_name: string;
    streak: number;
    lastAction?: string;
  } | null;
}

export function PartnerActivity({ partner }: PartnerProps) {
  if (!partner) {
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm text-center">
        <p className="text-zinc-500 mb-4">У тебя пока нет партнёра</p>
        <Link 
          href="/dashboard/partners"
          className="inline-block text-violet-600 hover:text-violet-700 font-medium"
        >
          Пригласить партнёра →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-zinc-900">Твой партнёр</h2>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-3xl font-medium">
          {partner.display_name[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <p className="font-medium text-zinc-900">{partner.display_name}</p>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-orange-500">🔥</span>
            <span className="font-medium text-zinc-700">
              Стрик: {partner.streak} {partner.streak === 1 ? "день" : "дней"}
            </span>
          </div>
        </div>
      </div>

      {partner.lastAction && (
        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4">
          <p className="text-sm text-zinc-500 mb-1">Последняя активность</p>
          <p className="text-zinc-700">{partner.lastAction}</p>
        </div>
      )}
    </div>
  );
}