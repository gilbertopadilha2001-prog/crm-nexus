import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const include = {
  agent: { select: { id: true, name: true, avatar: true } },
  property: { select: { id: true, title: true, type: true, region: true } },
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");
  const agentId = searchParams.get("agentId");
  const q = searchParams.get("q");

  const where: Record<string, unknown> = {};
  if (stage) where.stage = stage;
  if (agentId) where.agentId = agentId;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    include,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { name, phone, email, stage, value, interest, notes, agentId, propertyId, source } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "Nome e telefone são obrigatórios" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      name,
      phone,
      email: email || null,
      stage: stage || "novo",
      value: value ? Number(value) : null,
      interest: interest ? JSON.stringify(interest) : null,
      notes: notes || null,
      agentId: agentId || session.user.id,
      propertyId: propertyId || null,
      source: source || "manual",
    },
    include,
  });

  return NextResponse.json(lead, { status: 201 });
}
