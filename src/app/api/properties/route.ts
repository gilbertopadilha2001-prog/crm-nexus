import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { region: { contains: q } },
    ];
  }

  const properties = await prisma.property.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(properties);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { title, type, region, price, bedrooms, area, notes } = body;

  if (!title || !type || !region || !price) {
    return NextResponse.json({ error: "Título, tipo, região e preço são obrigatórios" }, { status: 400 });
  }

  const property = await prisma.property.create({
    data: {
      title,
      type,
      region,
      price: Number(price),
      bedrooms: bedrooms ? Number(bedrooms) : null,
      area: area ? Number(area) : null,
      notes: notes || null,
      status: "available",
    },
  });

  return NextResponse.json(property, { status: 201 });
}
