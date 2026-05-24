import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
  });

  await prisma.conversation.update({
    where: { id },
    data: { unread: 0 },
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });

  const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://evolution:8080";
  const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (user?.whatsappInstanceId && user.whatsappStatus === "connected") {
    await fetch(`${EVOLUTION_API_URL}/message/sendText/${user.whatsappInstanceId}`, {
      method: "POST",
      headers: { "X-API-Key": EVOLUTION_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ number: conversation.phone, text }),
    }).catch(() => {});
  }

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      text,
      sent: true,
      read: true,
    },
  });

  await prisma.conversation.update({
    where: { id },
    data: { lastMessage: text, lastAt: new Date() },
  });

  return NextResponse.json(message, { status: 201 });
}
