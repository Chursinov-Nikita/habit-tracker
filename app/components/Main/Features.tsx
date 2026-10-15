import { Bell, ChartNoAxesColumn, Star, Target } from "lucide-react";

const features = [
  {
    title: "Постановка целей",
    text: "Устанавливай цели и разбивай их на простые шаги.",
    Icon: Target,
    tone: "bg-[#8B5CF6]/15 text-[#8B5CF6]",
  },
  {
    title: "Аналитика прогресса",
    text: "Следи за своим прогрессом в удобной статистике.",
    Icon: ChartNoAxesColumn,
    tone: "bg-[#3B82F6]/15 text-[#3B82F6]",
  },
  {
    title: "Напоминания",
    text: "Не забывай о важных привычках.",
    Icon: Bell,
    tone: "bg-[#8B5CF6]/15 text-[#8B5CF6]",
  },
  {
    title: "Мотивация",
    text: "Вдохновляйся, когда это нужно больше всего.",
    Icon: Star,
    tone: "bg-[#8B5CF6]/15 text-[#8B5CF6]",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl scroll-mt-20 px-6 pb-8 pt-10 sm:pt-12"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#94A3B8] sm:text-[11px] sm:tracking-[0.25em]">
        Почему выбирают HabitTrack
      </p>
      <h2 className="mt-4 text-[28px] font-display font-bold leading-tight sm:text-4xl">
        Инструменты, которые
        <span className="bg-[linear-gradient(90deg,#8B5CF6_0%,#3B82F6_100%)] bg-clip-text text-transparent block">
          работают на тебя
        </span>
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ title, text, Icon, tone }) => (
          <div
            key={title}
            className="rounded-xl border border-white/10 bg-[#111827]/70 p-5 transition hover:-translate-y-0.5 hover:border-[#8B5CF6]/40 sm:p-6"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}
            >
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <h3 className="mt-5 text-sm font-semibold">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-[#94A3B8]">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
