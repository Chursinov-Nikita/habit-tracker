import { ChevronRight } from "lucide-react";
import GradientText from "./GradientText";

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

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="mx-auto max-w-[1280px] scroll-mt-20 px-6 pb-20 mb-25 pt-12 sm:pb-24 sm:pt-16"
    >
      <div className="grid items-center gap-8 xl:grid-cols-[auto_1fr] xl:gap-16">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#94A3B8] sm:text-[11px] sm:tracking-[0.25em]">
            Как это работает
          </p>
          <h2 className="mt-3 text-[28px] font-bold sm:whitespace-nowrap sm:text-4xl font-display font-display">
            Всего <GradientText>3 простых шага</GradientText>
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
  );
}
