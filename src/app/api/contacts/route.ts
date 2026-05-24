import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const contacts = await prisma.contact.findMany({
    where,
    include: { agent: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.contact.count();
  const qualified = await prisma.contact.count({ where: { tags: { contains: "qualificado" } } });

  return NextResponse.json({ contacts, total, qualified });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { name, phone, email, source, tags, notes } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "Nome e telefone são obrigatórios" }, { status: 400 });
  }

  const existing = await prisma.contact.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ error: "Telefone já cadastrado" }, { status: 409 });
  }

  const contact = await prisma.contact.create({
    data: {
      name,
      phone,
      email: email || null,
      source: source || "manual",
      tags: tags ? JSON.stringify(tags) : null,
      notes: notes || null,
      agentId: session.user.id,
    },
    include: { agent: { select: { id: true, name: true, avatar: true } } },
  });

  return NextResponse.json(contact, { status: 201 });
}
