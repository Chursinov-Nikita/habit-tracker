import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { askGigaChat } from "@/app/lib/gigachat";

export const runtime = "nodejs";

const calls = new Map<string, number[]>();

const limited = (userId: string) => {
  const now = Date.now();
  const recent = (calls.get(userId) ?? []).filter((t) => now - t < 600000);
  if (recent.length >= 15) {
    calls.set(userId, recent);
    return true;
  }
  calls.set(userId, [...recent, now]);
  return false;
};

const clean = (value: unknown, max: number) =>
  typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, max)
    : "";

const parse = (text: string) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const raw = JSON.parse(text.slice(start, end + 1));
    const harm: string[] = Array.isArray(raw.harm)
      ? raw.harm
          .map((item: unknown) => clean(item, 160))
          .filter(Boolean)
          .slice(0, 4)
      : [];
    const benefits: { when: string; text: string }[] = Array.isArray(
      raw.benefits,
    )
      ? raw.benefits
          .map((item: { when?: unknown; text?: unknown }) => ({
            when: clean(item?.when, 30),
            text: clean(item?.text, 160),
          }))
          .filter((item: { when: string; text: string }) => item.text)
          .slice(0, 4)
      : [];
    const motivation = clean(raw.motivation, 400);
    const tip = clean(raw.tip, 200);
    if (harm.length === 0 || !motivation) return null;
    return { harm, benefits, motivation, tip };
  } catch {
    return null;
  }
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = clean(body?.name, 40).replace(/["«»“”<>{}]/g, "");
  if (!name)
    return NextResponse.json({ error: "Name required" }, { status: 400 });

  const key = name.toLowerCase();
  const cached = await prisma.habitInfo.findUnique({ where: { key } });
  if (cached) return NextResponse.json(JSON.parse(cached.content));

  if (limited(session.user.id)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const text = await askGigaChat([
      {
        role: "system",
        content:
          "Ты — доброжелательный коуч, который помогает отказаться от вредных привычек. Пиши по-русски, коротко и по делу, без морализаторства и запугивания, без медицинских диагнозов. Отвечай только JSON без markdown и пояснений.",
      },
      {
        role: "user",
        content: `Привычка: ${name}.
Верни JSON строго такого вида:
{"harm":["...","...","..."],"benefits":[{"when":"через 1 день","text":"..."},{"when":"через неделю","text":"..."},{"when":"через месяц","text":"..."}],"motivation":"...","tip":"..."}
harm: 3 коротких пункта о том, чем эта привычка вредна (до 120 символов каждый).
benefits: 3 пункта о том, что улучшится после отказа, с примерными сроками.
motivation: 2-3 тёплых вдохновляющих предложения.
tip: один конкретный совет, как не сорваться.
Если привычка вредна не для здоровья, а для продуктивности или денег, опиши именно этот вред.`,
      },
    ]);

    const info = parse(text);
    if (!info)
      return NextResponse.json({ error: "Bad answer" }, { status: 502 });

    await prisma.habitInfo.upsert({
      where: { key },
      update: {},
      create: { key, content: JSON.stringify(info) },
    });

    return NextResponse.json(info);
  } catch (error) {
    console.error("GigaChat error:", error);
    return NextResponse.json({ error: "AI unavailable" }, { status: 502 });
  }
}
