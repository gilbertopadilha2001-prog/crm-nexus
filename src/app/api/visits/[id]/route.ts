import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const include = {
  lead: { select: { id: true, name: true, phone: true } },
  property: { select: { id: true, title: true, type: true, region: true, price: true } },
  agent: { select: { id: true, name: true, avatar: true } },
};

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const visit = await prisma.visit.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.scheduledAt !== undefined && { scheduledAt: new Date(body.scheduledAt) }),
      ...(body.propertyId !== undefined && { propertyId: body.propertyId }),
    },
    include,
  });

  return NextResponse.json(visit);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.visit.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
