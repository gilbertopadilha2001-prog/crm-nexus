import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const include = {
  lead: { select: { id: true, name: true, phone: true } },
  property: { select: { id: true, title: true, type: true, region: true, price: true } },
  agent: { select: { id: true, name: true, avatar: true } },
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const agentId = searchParams.get("agentId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (agentId) where.agentId = agentId;

  const visits = await prisma.visit.findMany({
    where,
    include,
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(visits);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { leadId, propertyId, scheduledAt, notes } = body;

  if (!scheduledAt) {
    return NextResponse.json({ error: "Data é obrigatória" }, { status: 400 });
  }

  const visit = await prisma.visit.create({
    data: {
      leadId: leadId || null,
      propertyId: propertyId || null,
      agentId: session.user.id,
      scheduledAt: new Date(scheduledAt),
      notes: notes || null,
      status: "scheduled",
    },
    include,
  });

  return NextResponse.json(visit, { status: 201 });
}
