import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      key: true,
      name: true,
      category: true,
      icon: true,
      custom: true,
      selected: true,
      goalDays: true,
      tracked: true,
      trackedGoal: true,
      startedAt: true,
      best: true,
      relapses: true,
    },
  });

  return NextResponse.json(habits);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const body = await req.json().catch(() => null);
  const input: unknown[] = Array.isArray(body?.habits)
    ? body.habits.slice(0, 200)
    : [];

  const habits = input
    .flatMap((item) => {
      const h = item as Record<string, unknown>;
      if (
        typeof h?.key !== "string" ||
        typeof h.name !== "string" ||
        typeof h.category !== "string" ||
        typeof h.icon !== "string"
      ) {
        return [];
      }
      const goalDays = Number(h.goalDays);
      return [
        {
          key: h.key.slice(0, 64),
          name: h.name.trim().slice(0, 40),
          category: h.category.slice(0, 40),
          icon: h.icon.slice(0, 20),
          custom: h.custom === true,
          selected: h.selected === true,
          goalDays:
            Number.isInteger(goalDays) && goalDays > 0 && goalDays <= 365
              ? goalDays
              : 30,
        },
      ];
    })
    .filter((h) => h.name);

  const keys = habits.map((h) => h.key);

  await prisma.$transaction([
    prisma.habit.deleteMany({
      where: { userId, custom: true, key: { notIn: keys } },
    }),
    prisma.habit.updateMany({
      where: { userId, key: { notIn: keys } },
      data: { selected: false },
    }),
    ...habits.map((h) =>
      prisma.habit.upsert({
        where: { userId_key: { userId, key: h.key } },
        update: { selected: h.selected, goalDays: h.goalDays },
        create: { userId, ...h },
      }),
    ),
  ]);

  return NextResponse.json({ ok: true });
}
