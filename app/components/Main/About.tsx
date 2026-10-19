import {
  ChevronRight,
  Bell,
  ChartNoAxesColumn,
  Star,
  Target,
} from "lucide-react";

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

const steps = [
  {
    n: "01",
    title: "Выбери привычки",
    text: "Отметь, что хочешь изменить или добавить.",
  },
  {
    n: "02",
    title: "Следи за прогрессом",
    text: "Отмечай выполнение каждый день.",
  },
  { n: "03", title: "Достигай целей", text: "Становись лучше с каждым днем." },
];

export default function About() {
  return (
    <>
      <section
        id="features"
        className="mx-auto max-w-7xl scroll-mt-20 px-6 pb-16 pt-10 sm:pb-20 sm:pt-12"
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
      <section
        id="about"
        className="mx-auto max-w-7xl scroll-mt-24 px-6 pb-20 sm:pb-32"
      >
        <div className="grid items-center gap-8 rounded-2xl border border-white/10 bg-[#111827]/50 p-6 sm:p-8 xl:grid-cols-[auto_1fr] xl:gap-16 xl:p-10">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#94A3B8] sm:text-[11px] sm:tracking-[0.25em]">
              Как это работает
            </p>
            <h2 className="mt-3 text-[28px] font-bold sm:whitespace-nowrap sm:text-4xl font-display">
              Всего{" "}
              <span className="bg-[linear-gradient(90deg,#8B5CF6_0%,#3B82F6_100%)] bg-clip-text text-transparent">
                3 простых шага
              </span>
            </h2>
          </div>
          <ol className="grid gap-6 md:grid-cols-3 md:gap-10">
            {steps.map((s, i) => (
              <li key={s.n} className="relative flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#111827] text-xs font-medium text-white/80">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-[#94A3B8]">
                    {s.text}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight
                    className="absolute -right-6 top-3 hidden h-4 w-4 text-white/30 md:block"
                    strokeWidth={2}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
