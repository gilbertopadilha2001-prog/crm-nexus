import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const contact = await prisma.contact.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.tags !== undefined && { tags: typeof body.tags === "string" ? body.tags : JSON.stringify(body.tags) }),
      ...(body.active !== undefined && { active: body.active }),
    },
    include: { agent: { select: { id: true, name: true, avatar: true } } },
  });

  return NextResponse.json(contact);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.contact.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
