import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const now = new Date();
  const selected = await prisma.habit.findMany({
    where: { userId, selected: true },
  });

  await prisma.$transaction([
    prisma.habitLog.deleteMany({
      where: { habit: { userId, selected: false, tracked: true } },
    }),
    prisma.habit.updateMany({
      where: { userId, selected: false, tracked: true },
      data: { tracked: false, startedAt: null, best: 0, relapses: 0 },
    }),
    ...selected.map((h) =>
      prisma.habit.update({
        where: { id: h.id },
        data: h.tracked
          ? { trackedGoal: h.goalDays }
          : {
              tracked: true,
              trackedGoal: h.goalDays,
              startedAt: now,
              best: 0,
              relapses: 0,
            },
      }),
    ),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  await prisma.$transaction([
    prisma.habitLog.deleteMany({ where: { habit: { userId } } }),
    prisma.habit.updateMany({
      where: { userId },
      data: {
        selected: false,
        tracked: false,
        startedAt: null,
        best: 0,
        relapses: 0,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
