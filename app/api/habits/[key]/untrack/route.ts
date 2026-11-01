import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await params;
  const habit = await prisma.habit.findUnique({
    where: { userId_key: { userId: session.user.id, key } },
  });
  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.habitLog.deleteMany({ where: { habitId: habit.id } }),
    prisma.habit.update({
      where: { id: habit.id },
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
