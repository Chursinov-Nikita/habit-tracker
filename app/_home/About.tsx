import Link from "next/link";
import {
  ArrowRight,
  ChartNoAxesColumn,
  Sparkles,
  Target,
  Wind,
} from "lucide-react";

const features = [
  {
    title: "Цель в днях",
    text: "Выбери готовый срок или задай свой. Кольцо прогресса покажет, сколько осталось.",
    Icon: Target,
  },
  {
    title: "Календарь и рекорды",
    text: "Дни без срывов и срывы в календаре, серии и рекорды — всё видно с первого взгляда.",
    Icon: ChartNoAxesColumn,
  },
  {
    title: "Разбор от ИИ",
    text: "Чем вредна привычка, что изменится, если бросить, и план на первую неделю.",
    Icon: Sparkles,
  },
  {
    title: "Медитация и поддержка",
    text: "Дыхательные практики, уровни и достижения помогают не сорваться в трудный момент.",
    Icon: Wind,
  },
];

const steps = [
  {
    n: "1",
    title: "Выбери привычки",
    text: "Возьми готовую из списка или создай свою и задай цель в днях.",
  },
  {
    n: "2",
    title: "Держи серию",
    text: "Дни без срыва засчитываются сами. Сорвался — отметь, рекорд сохранится.",
  },
  {
    n: "3",
    title: "Достигай целей",
    text: "Смотри, как недели складываются в месяцы, и становись лучше.",
  },
];

export default function About() {
  return (
    <>
      <section
        id="features"
        className="mx-auto max-w-7xl scroll-mt-20 px-6 py-20 sm:py-28"
      >
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
              Инструменты, которые работают на тебя
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-400">
              Ничего лишнего: только то, что помогает продержаться ещё один
              день.
            </p>
          </div>

          <ul className="border-t border-white/10">
            {features.map(({ title, text, Icon }) => (
              <li
                key={title}
                className="grid grid-cols-[auto_1fr] gap-x-5 border-b border-white/10 py-7 sm:gap-x-7 sm:py-8"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent-soft">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold leading-7">{title}</h3>
                  <p className="mt-1.5 max-w-lg text-[15px] leading-7 text-slate-400">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="about"
        className="mx-auto max-w-7xl scroll-mt-24 px-6 pb-20 sm:pb-28"
      >
        <div>
          <h2 className="font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
            Всего три простых шага
          </h2>

          <ol className="relative mt-12 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-8">
            <span
              aria-hidden="true"
              className="absolute bottom-24 left-6 top-6 w-px bg-linear-to-b from-accent via-primary/60 to-[#3B82F6]/40 md:bottom-auto md:left-6 md:right-[calc((100%-4rem)/3-1.5rem)] md:top-6 md:h-px md:w-auto md:bg-linear-to-r"
            />
            {steps.map((s) => (
              <li
                key={s.n}
                className="relative grid grid-cols-[auto_1fr] gap-x-5 md:block"
              >
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-ink font-display text-lg font-semibold text-accent-pale shadow-[0_0_24px_-6px_rgba(139,92,246,0.7)]">
                  {s.n}
                </span>
                <div className="md:mt-7 md:pr-6">
                  <h3 className="text-lg font-semibold leading-7 md:text-xl">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-slate-400">
                    {s.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 sm:pb-32">
        <div className="relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-surface/60 px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/35 blur-[110px]" />
          <h2 className="mx-auto max-w-3xl text-balance font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-5xl">
            Сегодня — первый день новой жизни
          </h2>
          <p className="mx-auto mt-5 max-w-md text-balance text-base leading-7 text-slate-400">
            Оставь привычку во вчерашнем дне. Впереди больше энергии, свободы
            и веры в себя.
          </p>
          <Link
            href="/habits"
            className="group mt-9 inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-ink transition duration-300 hover:bg-[#EDE9FE] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-soft"
          >
            Начать серию
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </Link>
        </div>
      </section>
    </>
  );
}
