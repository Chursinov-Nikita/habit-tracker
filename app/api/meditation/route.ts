import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { dayKey, parseTz } from "@/app/lib/days";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tz = parseTz(new URL(req.url).searchParams.get("tz")) ?? 0;
  const day = dayKey(new Date(), tz);

  const result = await prisma.meditationSession.aggregate({
    where: { userId: session.user.id, day },
    _count: true,
    _sum: { minutes: true },
  });

  return NextResponse.json({
    sessions: result._count,
    minutes: result._sum.minutes ?? 0,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const minutes = Number(body?.minutes);
  const tz = parseTz(body?.tz);
  if (
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    minutes > 120 ||
    tz === null
  ) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  await prisma.meditationSession.create({
    data: {
      userId: session.user.id,
      day: dayKey(new Date(), tz),
      minutes,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
