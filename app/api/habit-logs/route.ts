import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { dayKey, daysBetween } from "@/app/lib/days";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") ?? "";
  const tz = Number(searchParams.get("tz") ?? 0);
  if (!/^\d{4}-\d{2}$/.test(month) || !Number.isFinite(tz)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const today = dayKey(new Date(), tz);
  const habits = await prisma.habit.findMany({
    where: { userId, tracked: true, startedAt: { not: null } },
  });

  const missing = habits.flatMap((habit) =>
    daysBetween(dayKey(habit.startedAt!, tz), today).map((day) => ({
      habitId: habit.id,
      day,
      completed: true,
    })),
  );
  if (missing.length > 0) {
    await prisma.habitLog.createMany({ data: missing, skipDuplicates: true });
  }

  const logs = await prisma.habitLog.findMany({
    where: { habit: { userId, tracked: true }, day: { startsWith: month } },
  });

  return NextResponse.json(
    logs.map((log) => ({
      id: log.id,
      habitId: log.habitId,
      date: log.day,
      completed: log.completed,
    })),
  );
}
