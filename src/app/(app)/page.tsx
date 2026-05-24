"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare, Users, Send, TrendingUp, Target, Clock,
  ArrowUpRight, BarChart3, Phone, Home, DollarSign, Loader2,
} from "lucide-react";

interface Stats {
  totalLeads: number;
  newLeadsToday: number;
  conversionRate: string;
  pendingDealsValue: number;
  totalContacts: number;
  pendingFollowUps: number;
  activeConversations: number;
  totalProperties: number;
  broadcastsSentThisMonth: number;
  kanban: Record<string, number>;
  agentRanking: { id: string; name: string; avatar: string | null; leads: number; conversions: number; rate: string }[];
  recentLeads: { id: string; name: string; phone: string; stage: string; agentName: string; createdAt: string }[];
}

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  novo:         { bg: "rgba(255,212,112,0.15)", text: "#FFD470" },
  qualificando: { bg: "rgba(59,130,246,0.15)",  text: "#3B82F6" },
  proposta:     { bg: "rgba(139,92,246,0.15)",  text: "#8B5CF6" },
  negociando:   { bg: "rgba(245,158,11,0.15)",  text: "#F59E0B" },
  fechado:      { bg: "rgba(16,185,129,0.15)",  text: "#10B981" },
  perdido:      { bg: "rgba(239,68,68,0.15)",   text: "#EF4444" },
};

function StageTag({ stage }: { stage: string }) {
  const c = STAGE_COLORS[stage] ?? { bg: "#F2F3F6", text: "#56585E" };
  const label = stage.charAt(0).toUpperCase() + stage.slice(1);
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: c.bg, color: c.text }}>{label}</span>
  );
}

function fmt(v: number) {
  if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}K`;
  return `R$ ${v}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) return null;

  const mainStats = [
    { label: "Total de Leads",       value: String(stats.totalLeads),              change: `+${stats.newLeadsToday} hoje`, icon: Users,      color: "#FFD470" },
    { label: "Leads Novos Hoje",     value: String(stats.newLeadsToday),            change: "novos",                       icon: Target,     color: "#3B82F6" },
    { label: "Taxa de Conversão",    value: stats.conversionRate,                   change: "fechados/total",               icon: TrendingUp, color: "#10B981" },
    { label: "Negócios em Andamento",value: fmt(stats.pendingDealsValue),           change: "proposta+negociando",          icon: DollarSign, color: "#8B5CF6" },
  ];

  const secondaryStats = [
    { label: "Disparos Enviados",    value: String(stats.broadcastsSentThisMonth), sub: "este mês",    icon: Send,         color: "#F59E0B" },
    { label: "Follow-ups Pendentes", value: String(stats.pendingFollowUps),        sub: "próx. 24h",   icon: Clock,        color: "#EF4444" },
    { label: "Conversas Ativas",     value: String(stats.activeConversations),     sub: "WhatsApp",    icon: MessageSquare,color: "#06B6D4" },
    { label: "Imóveis Disponíveis",  value: String(stats.totalProperties),         sub: "cadastrados", icon: Home,         color: "#10B981" },
  ];

  const kanbanOrder = ["novo","qualificando","proposta","negociando","fechado","perdido"];
  const kanbanColors = ["#FFD470","#3B82F6","#8B5CF6","#F59E0B","#10B981","#EF4444"];
  const totalKanban = Object.values(stats.kanban).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral — Nexus Inovações Imobiliárias</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map(({ label, value, change, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border bg-card shadow-sm hover:shadow-elevated transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-display font-bold mt-1">{value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-success" />
                    <span className="text-xs font-medium text-success">{change}</span>
                  </div>
                </div>
                <div className="rounded-xl p-2.5" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {secondaryStats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="rounded-lg border bg-card p-4 flex items-center gap-3">
            <div className="rounded-lg p-2 flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-display font-bold leading-tight">{value}</p>
              <p className="text-[11px] text-muted-foreground truncate">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm">
          <div className="p-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-display font-semibold">Últimos Leads</h3>
            </div>
            <span className="text-xs text-muted-foreground">Tempo real</span>
          </div>
          <div className="divide-y">
            {stats.recentLeads.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">Nenhum lead cadastrado ainda</p>
            ) : stats.recentLeads.map((lead) => (
              <div key={lead.id} className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
                  {lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                    <StageTag stage={lead.stage} />
                  </div>
                  <p className="text-xs text-muted-foreground">{lead.phone}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px] text-muted-foreground">{timeAgo(lead.createdAt)}</p>
                  <p className="text-[11px] font-medium" style={{ color: "var(--nexus-gold)" }}>{lead.agentName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="p-5 border-b flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-display font-semibold">Funil de Vendas</h3>
            </div>
            <div className="p-5 space-y-3">
              {kanbanOrder.map((stage, i) => {
                const count = stats.kanban[stage] || 0;
                const label = stage.charAt(0).toUpperCase() + stage.slice(1);
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: kanbanColors[i] }} />
                    <span className="text-sm flex-1">{label}</span>
                    <span className="text-sm font-display font-bold">{count}</span>
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ backgroundColor: kanbanColors[i], width: `${(count / totalKanban) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm">
            <div className="p-5 border-b flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-display font-semibold">Top Corretores</h3>
            </div>
            <div className="divide-y">
              {stats.agentRanking.slice(0, 4).map((agent, i) => (
                <div key={agent.id} className="p-3 flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: i === 0 ? "var(--nexus-gold)" : "#F2F3F6", color: i === 0 ? "var(--nexus-dark)" : "#56585E" }}>
                    {agent.avatar || agent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{agent.name}</p>
                    <p className="text-[11px] text-muted-foreground">{agent.conversions} fechados</p>
                  </div>
                  <span className="text-sm font-display font-bold" style={{ color: "var(--nexus-gold)" }}>{agent.rate}</span>
                </div>
              ))}
              {stats.agentRanking.length === 0 && (
                <p className="p-4 text-xs text-center text-muted-foreground">Nenhum corretor ainda</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
