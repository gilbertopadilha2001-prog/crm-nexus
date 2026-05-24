import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Evolution API envia eventos aqui — configure: EVOLUTION_WEBHOOK_URL/api/evolution/webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, data } = body;

    if (event === "messages.upsert" && data?.messages?.length) {
      for (const msg of data.messages) {
        if (msg.key?.fromMe) continue;

        const phone = msg.key?.remoteJid?.replace("@s.whatsapp.net", "");
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
        const pushName = msg.pushName;

        if (!phone || !text) continue;

        let conversation = await prisma.conversation.findUnique({ where: { phone } });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              phone,
              name: pushName || phone,
              lastMessage: text,
              lastAt: new Date(),
              unread: 1,
            },
          });
        } else {
          await prisma.conversation.update({
            where: { phone },
            data: {
              name: pushName || conversation.name,
              lastMessage: text,
              lastAt: new Date(),
              unread: { increment: 1 },
            },
          });
        }

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            text,
            sent: false,
            read: false,
            remoteId: msg.key?.id,
          },
        });
      }
    }

    if (event === "connection.update") {
      const { instance, state } = data;
      if (instance && state) {
        const user = await prisma.user.findFirst({ where: { whatsappInstanceId: instance } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              whatsappStatus: state === "open" ? "connected" : state === "close" ? "disconnected" : "scanning",
              ...(state !== "open" && { whatsappPhone: null }),
            },
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
