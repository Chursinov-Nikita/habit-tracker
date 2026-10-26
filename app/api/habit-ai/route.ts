import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { askGigaChat } from "@/app/lib/gigachat";

export const runtime = "nodejs";
export const maxDuration = 120;

const GAP = 5;
const WINDOW = 600000;
const LIMIT = 15;

const calls = new Map<string, number[]>();

const retryAfter = (userId: string) => {
  const now = Date.now();
  const recent = (calls.get(userId) ?? []).filter((t) => now - t < WINDOW);
  calls.set(userId, recent);
  const last = recent[recent.length - 1];
  if (last && now - last < GAP * 1000) {
    return Math.ceil((GAP * 1000 - (now - last)) / 1000);
  }
  if (recent.length >= LIMIT) {
    return Math.ceil((recent[0] + WINDOW - now) / 1000);
  }
  return 0;
};

const clean = (value: unknown, max: number) =>
  typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, max)
    : "";

const list = (value: unknown, max: number, size: number): string[] =>
  Array.isArray(value)
    ? value
        .map((item: unknown) => clean(item, size))
        .filter(Boolean)
        .slice(0, max)
    : [];

const parse = (text: string) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const raw = JSON.parse(
      text.slice(start, end + 1).replace(/,\s*([}\]])/g, "$1"),
    );

    const harm: { title: string; text: string }[] = Array.isArray(raw.harm)
      ? raw.harm
          .map((item: unknown) => {
            if (typeof item === "string")
              return { title: "", text: clean(item, 200) };
            const value = item as { title?: unknown; text?: unknown };
            return {
              title: clean(value?.title, 40),
              text: clean(value?.text, 200),
            };
          })
          .filter((item: { text: string }) => item.text)
          .slice(0, 5)
      : [];

    const benefits: { when: string; text: string }[] = Array.isArray(
      raw.benefits,
    )
      ? raw.benefits
          .map((item: { when?: unknown; text?: unknown }) => ({
            when: clean(item?.when, 30),
            text: clean(item?.text, 180),
          }))
          .filter(
            (item: { when: string; text: string }) => item.text && item.when,
          )
          .slice(0, 6)
      : [];

    const motivation = clean(raw.motivation, 500);
    if (harm.length === 0 || !motivation) return null;

    return {
      summary: clean(raw.summary, 400),
      harm,
      benefits,
      facts: list(raw.facts, 4, 220),
      triggers: list(raw.triggers, 5, 80),
      alternatives: list(raw.alternatives, 5, 80),
      steps: list(raw.steps, 5, 160),
      motivation,
      tip: clean(raw.tip, 240),
    };
  } catch {
    return null;
  }
};

type Info = NonNullable<ReturnType<typeof parse>>;

const complete = (value: Info | null): value is Info =>
  value !== null &&
  value.summary !== "" &&
  value.benefits.length >= 3 &&
  value.facts.length >= 2 &&
  value.steps.length >= 2;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const body = await req.json().catch(() => null);
  const name = clean(body?.name, 40).replace(/["«»“”<>{}]/g, "");
  if (!name)
    return NextResponse.json({ error: "Name required" }, { status: 400 });

  const key = `v3:${name.toLowerCase()}`;
  const cached = await prisma.habitInfo.findUnique({ where: { key } });
  if (cached)
    return NextResponse.json({ ...JSON.parse(cached.content), cooldown: 0 });

  const wait = retryAfter(userId);
  if (wait > 0) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: wait },
      { status: 429, headers: { "Retry-After": String(wait) } },
    );
  }
  calls.set(userId, [...(calls.get(userId) ?? []), Date.now()]);

  const messages = [
    {
      role: "system" as const,
      content:
        "Ты — доброжелательный коуч, который помогает отказаться от вредных привычек. Пиши по-русски, коротко и по делу, без морализаторства и запугивания, без медицинских диагнозов. Отвечай только JSON без markdown и пояснений. Обязательно заполняй все поля, пустых полей и массивов быть не должно.",
    },
    {
      role: "user" as const,
      content: `Привычка: ${name}.
Верни JSON строго такого вида, ключи не переименовывай:
{"summary":"...","harm":[{"title":"...","text":"..."}],"benefits":[{"when":"через день","text":"..."}],"facts":["..."],"triggers":["..."],"alternatives":["..."],"steps":["..."],"motivation":"...","tip":"..."}
Требования, пиши максимально коротко:
summary: 1-2 коротких предложения, до 200 символов. Поле обязательно.
harm: 4 пункта, title до 3 слов (например, «Сердце и сосуды»), text до 90 символов.
benefits: ровно 5 объектов с полями when и text по возрастанию срока (через день, через неделю, через месяц, через 3 месяца, через год), text до 80 символов. Поле обязательно.
facts: 3 коротких факта общими словами, без точных цифр, до 110 символов каждый.
triggers: 4 типичные ситуации, когда тянет, до 35 символов каждая.
alternatives: 4 полезные замены, до 40 символов каждая.
steps: 4 шага плана на первую неделю, до 70 символов каждый.
motivation: 2 тёплых вдохновляющих предложения, до 220 символов.
tip: один совет, как не сорваться, до 120 символов.
Если привычка вредна не для здоровья, а для продуктивности, денег или отношений, опиши именно этот вред.`,
    },
  ];

  let info: Info | null = null;
  let best: Info | null = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 3 && !info; attempt++) {
    try {
      const text = await askGigaChat(messages, 1100);
      const result = parse(text);
      if (complete(result)) {
        info = result;
      } else if (result) {
        console.error("GigaChat incomplete answer:", text);
        if (!best) best = result;
      } else {
        console.error("GigaChat bad answer:", text);
      }
    } catch (error) {
      lastError = error;
      console.error("GigaChat error:", error);
    }
  }

  if (!info && best) {
    return NextResponse.json({ ...best, cooldown: GAP });
  }

  if (!info) {
    return NextResponse.json(
      {
        error: lastError ? "AI unavailable" : "Bad answer",
        detail:
          process.env.NODE_ENV === "production"
            ? undefined
            : lastError
              ? String(lastError)
              : "Unparsable answer",
      },
      { status: 502 },
    );
  }

  await prisma.habitInfo.upsert({
    where: { key },
    update: {},
    create: { key, content: JSON.stringify(info) },
  });

  return NextResponse.json({ ...info, cooldown: GAP });
}
