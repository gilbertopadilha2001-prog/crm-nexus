import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalLeads,
    newLeadsToday,
    closedLeads,
    lostLeads,
    totalContacts,
    pendingFollowUps,
    activeConversations,
    totalProperties,
    kanbanCounts,
    topAgents,
    recentLeads,
    totalBroadcastsSent,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.lead.count({ where: { stage: "fechado" } }),
    prisma.lead.count({ where: { stage: "perdido" } }),
    prisma.contact.count({ where: { active: true } }),
    prisma.followUp.count({ where: { done: false, scheduledAt: { lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) } } }),
    prisma.conversation.count(),
    prisma.property.count({ where: { status: "available" } }),
    prisma.lead.groupBy({ by: ["stage"], _count: { id: true } }),
    prisma.user.findMany({
      where: { role: "AGENT", active: true },
      select: {
        id: true,
        name: true,
        avatar: true,
        leads: { select: { id: true, stage: true } },
      },
      take: 5,
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { agent: { select: { name: true } } },
    }),
    prisma.broadcast.aggregate({ _sum: { totalSent: true }, where: { status: "sent", sentAt: { gte: startOfMonth } } }),
  ]);

  const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : "0.0";
  const pendingDeals = await prisma.lead.aggregate({
    _sum: { value: true },
    where: { stage: { in: ["proposta", "negociando"] } },
  });

  const stageMap = Object.fromEntries(kanbanCounts.map((k) => [k.stage, k._count.id]));

  const agentRanking = topAgents.map((a) => ({
    id: a.id,
    name: a.name,
    avatar: a.avatar,
    leads: a.leads.length,
    conversions: a.leads.filter((l) => l.stage === "fechado").length,
    rate: a.leads.length > 0 ? ((a.leads.filter((l) => l.stage === "fechado").length / a.leads.length) * 100).toFixed(1) + "%" : "0%",
  }));

  return NextResponse.json({
    totalLeads,
    newLeadsToday,
    conversionRate: `${conversionRate}%`,
    pendingDealsValue: pendingDeals._sum.value || 0,
    totalContacts,
    pendingFollowUps,
    activeConversations,
    totalProperties,
    broadcastsSentThisMonth: totalBroadcastsSent._sum.totalSent || 0,
    kanban: {
      novo: stageMap["novo"] || 0,
      qualificando: stageMap["qualificando"] || 0,
      proposta: stageMap["proposta"] || 0,
      negociando: stageMap["negociando"] || 0,
      fechado: stageMap["fechado"] || 0,
      perdido: stageMap["perdido"] || 0,
    },
    agentRanking,
    recentLeads: recentLeads.map((l) => ({
      id: l.id,
      name: l.name,
      phone: l.phone,
      stage: l.stage,
      agentName: l.agent?.name || "—",
      createdAt: l.createdAt,
    })),
  });
}
