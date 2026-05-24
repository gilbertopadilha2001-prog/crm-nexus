import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const include = {
  agent: { select: { id: true, name: true, avatar: true } },
  property: { select: { id: true, title: true, type: true, region: true } },
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id }, include });
  if (!lead) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });

  return NextResponse.json(lead);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, phone, email, stage, value, interest, notes, agentId, propertyId } = body;

  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });

  const stageChanged = stage && stage !== existing.stage;

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(stage !== undefined && { stage }),
      ...(value !== undefined && { value: value ? Number(value) : null }),
      ...(interest !== undefined && { interest: typeof interest === "string" ? interest : JSON.stringify(interest) }),
      ...(notes !== undefined && { notes }),
      ...(agentId !== undefined && { agentId }),
      ...(propertyId !== undefined && { propertyId }),
      ...(stageChanged && { daysInStage: 0 }),
    },
    include,
  });

  return NextResponse.json(lead);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.lead.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
