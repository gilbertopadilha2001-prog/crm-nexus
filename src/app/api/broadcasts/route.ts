import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const broadcasts = await prisma.broadcast.findMany({
    include: {
      agent: { select: { id: true, name: true, avatar: true } },
      _count: { select: { recipients: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(broadcasts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { name, message, scheduledAt, recipients } = body;

  if (!name || !message) {
    return NextResponse.json({ error: "Nome e mensagem são obrigatórios" }, { status: 400 });
  }

  const broadcast = await prisma.broadcast.create({
    data: {
      name,
      message,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      agentId: session.user.id,
      status: scheduledAt ? "scheduled" : "draft",
      recipients: recipients?.length
        ? {
            create: (recipients as { phone: string; name?: string }[]).map((r) => ({
              phone: r.phone,
              name: r.name || null,
            })),
          }
        : undefined,
    },
    include: {
      agent: { select: { id: true, name: true, avatar: true } },
      _count: { select: { recipients: true } },
    },
  });

  return NextResponse.json(broadcast, { status: 201 });
}
