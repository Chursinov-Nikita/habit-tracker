import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { dayKey, daysBetween, parseTz } from "@/app/lib/days";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") ?? "";
  const tz = parseTz(searchParams.get("tz"));
  if (!/^\d{4}-\d{2}$/.test(month) || tz === null) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const today = dayKey(new Date(), tz);
  const [year, mon] = month.split("-").map(Number);
  const monthStart = `${month}-01`;
  const monthEnd = new Date(Date.UTC(year, mon, 0)).toISOString().slice(0, 10);
  const habits = await prisma.habit.findMany({
    where: { userId, tracked: true, startedAt: { not: null } },
    select: { id: true, startedAt: true },
  });

  const missing = habits.flatMap((habit) => {
    const start = dayKey(habit.startedAt!, tz);
    const from = start > monthStart ? start : monthStart;
    const to = today < monthEnd ? today : monthEnd;
    return daysBetween(from, to).map((day) => ({
      habitId: habit.id,
      day,
      completed: true,
    }));
  });
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
