import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const property = await prisma.property.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.region !== undefined && { region: body.region }),
      ...(body.price !== undefined && { price: Number(body.price) }),
      ...(body.bedrooms !== undefined && { bedrooms: body.bedrooms ? Number(body.bedrooms) : null }),
      ...(body.area !== undefined && { area: body.area ? Number(body.area) : null }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });

  return NextResponse.json(property);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.property.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
