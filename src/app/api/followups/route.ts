import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const include = {
  lead: { select: { id: true, name: true, phone: true, stage: true } },
  agent: { select: { id: true, name: true, avatar: true } },
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const done = searchParams.get("done");
  const agentId = searchParams.get("agentId");

  const where: Record<string, unknown> = {};
  if (done !== null) where.done = done === "true";
  if (agentId) where.agentId = agentId;

  const followUps = await prisma.followUp.findMany({
    where,
    include,
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(followUps);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { leadId, scheduledAt, type, notes } = body;

  if (!scheduledAt) {
    return NextResponse.json({ error: "Data é obrigatória" }, { status: 400 });
  }

  const followUp = await prisma.followUp.create({
    data: {
      leadId: leadId || null,
      agentId: session.user.id,
      scheduledAt: new Date(scheduledAt),
      type: type || "call",
      notes: notes || null,
    },
    include,
  });

  return NextResponse.json(followUp, { status: 201 });
}
