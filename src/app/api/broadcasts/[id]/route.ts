import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const broadcast = await prisma.broadcast.findUnique({
    where: { id },
    include: {
      agent: { select: { id: true, name: true, avatar: true } },
      recipients: true,
    },
  });

  if (!broadcast) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(broadcast);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const broadcast = await prisma.broadcast.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.message !== undefined && { message: body.message }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.totalSent !== undefined && { totalSent: body.totalSent }),
      ...(body.totalFailed !== undefined && { totalFailed: body.totalFailed }),
      ...(body.sentAt !== undefined && { sentAt: body.sentAt ? new Date(body.sentAt) : null }),
    },
    include: {
      agent: { select: { id: true, name: true, avatar: true } },
      _count: { select: { recipients: true } },
    },
  });

  return NextResponse.json(broadcast);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.broadcast.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
