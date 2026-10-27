import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { dayKey, daysBetween, parseTz } from "@/app/lib/days";

const DAY = 86400000;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await params;
  const body = await req.json().catch(() => null);
  const tz = parseTz(body?.tz);
  if (tz === null) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const habit = await prisma.habit.findUnique({
    where: { userId_key: { userId: session.user.id, key } },
  });
  if (!habit || !habit.tracked || !habit.startedAt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();
  const today = dayKey(now, tz);
  const yesterday = dayKey(new Date(now.getTime() - DAY), tz);
  const days = Math.floor((now.getTime() - habit.startedAt.getTime()) / DAY);

  const [updated] = await prisma.$transaction([
    prisma.habit.update({
      where: { id: habit.id },
      data: {
        startedAt: now,
        best: Math.max(habit.best, days),
        relapses: { increment: 1 },
      },
    }),
    prisma.habitLog.createMany({
      data: daysBetween(dayKey(habit.startedAt, tz), yesterday).map((day) => ({
        habitId: habit.id,
        day,
        completed: true,
      })),
      skipDuplicates: true,
    }),
    prisma.habitLog.upsert({
      where: { habitId_day: { habitId: habit.id, day: today } },
      update: { completed: false },
      create: { habitId: habit.id, day: today, completed: false },
    }),
  ]);

  return NextResponse.json({
    startedAt: updated.startedAt,
    best: updated.best,
    relapses: updated.relapses,
  });
}
