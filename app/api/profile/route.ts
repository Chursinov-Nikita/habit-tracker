import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/app/lib/prisma";

const DAY = 86400000;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [user, habits, meditation] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
        accounts: { select: { provider: true } },
      },
    }),
    prisma.habit.findMany({
      where: { userId, tracked: true },
      select: {
        best: true,
        relapses: true,
        startedAt: true,
        trackedGoal: true,
      },
    }),
    prisma.meditationSession.aggregate({
      where: { userId },
      _count: true,
      _sum: { minutes: true },
    }),
  ]);

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = Date.now();
  const current = habits.map((h) =>
    h.startedAt ? Math.floor((now - h.startedAt.getTime()) / DAY) : 0,
  );

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    bio: user.bio,
    createdAt: user.createdAt,
    providers: user.accounts.map((a) => a.provider),
    stats: {
      habits: habits.length,
      bestStreak: habits.reduce(
        (max, h, i) => Math.max(max, h.best, current[i]),
        0,
      ),
      relapses: habits.reduce((sum, h) => sum + h.relapses, 0),
      goalsDone: habits.filter((h, i) => current[i] >= h.trackedGoal).length,
      sessions: meditation._count,
      minutes: meditation._sum.minutes ?? 0,
    },
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name =
    typeof body?.name === "string" ? body.name.trim().slice(0, 40) : undefined;
  const bio =
    typeof body?.bio === "string" ? body.bio.trim().slice(0, 160) : undefined;

  if (name !== undefined && !name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio: bio || null }),
    },
    select: { id: true, name: true, email: true, image: true, bio: true },
  });

  return NextResponse.json(user);
}
