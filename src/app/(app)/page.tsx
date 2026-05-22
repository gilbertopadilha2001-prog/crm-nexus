import {
  MessageSquare,
  Users,
  Send,
  TrendingUp,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Phone,
  Home,
  DollarSign,
} from "lucide-react";

const stats = [
  {
    label: "Total de Leads",
    value: "247",
    change: "+12%",
    trend: "up" as const,
    icon: Users,
    color: "#FFD470",
  },
  {
    label: "Leads Novos Hoje",
    value: "8",
    change: "+3",
    trend: "up" as const,
    icon: Target,
    color: "#3B82F6",
  },
  {
    label: "Taxa de Conversão",
    value: "18.5%",
    change: "+2.1%",
    trend: "up" as const,
    icon: TrendingUp,
    color: "#10B981",
  },
  {
    label: "Negócios em Andamento",
    value: "34",
    change: "R$ 2.8M",
    trend: "up" as const,
    icon: DollarSign,
    color: "#8B5CF6",
  },
];

const stats2 = [
  {
    label: "Disparos Enviados",
    value: "1.240",
    sub: "este mês",
    icon: Send,
    color: "#F59E0B",
  },
  {
    label: "Follow-ups Pendentes",
    value: "15",
    sub: "para hoje",
    icon: Clock,
    color: "#EF4444",
  },
  {
    label: "Conversas Ativas",
    value: "23",
    sub: "em andamento",
    icon: MessageSquare,
    color: "#06B6D4",
  },
  {
    label: "Imóveis Cadastrados",
    value: "89",
    sub: "disponíveis",
    icon: Home,
    color: "#10B981",
  },
];

const recentLeads = [
  { name: "Maria Silva", phone: "(41) 99876-5432", interest: "Apartamento 2Q - Água Verde", time: "5 min", agent: "Carlos", stage: "Novo" },
  { name: "João Santos", phone: "(41) 98765-4321", interest: "Casa 3Q - Santa Felicidade", time: "15 min", agent: "Ana", stage: "Qualificando" },
  { name: "Fernanda Costa", phone: "(41) 97654-3210", interest: "MCMV - Pinheirinho", time: "32 min", agent: "Pedro", stage: "Proposta" },
  { name: "Roberto Oliveira", phone: "(41) 96543-2109", interest: "Terreno - Campo Largo", time: "1h", agent: "Carlos", stage: "Novo" },
  { name: "Luciana Pereira", phone: "(41) 95432-1098", interest: "Apartamento 3Q - Batel", time: "2h", agent: "Ana", stage: "Negociando" },
];

const agentRanking = [
  { name: "Carlos Mendes", leads: 45, conversions: 12, rate: "26.7%", avatar: "CM" },
  { name: "Ana Rodrigues", leads: 38, conversions: 9, rate: "23.7%", avatar: "AR" },
  { name: "Pedro Lima", leads: 42, conversions: 8, rate: "19.0%", avatar: "PL" },
  { name: "Julia Ferreira", leads: 35, conversions: 6, rate: "17.1%", avatar: "JF" },
  { name: "Bruno Souza", leads: 30, conversions: 4, rate: "13.3%", avatar: "BS" },
];

const kanbanSummary = [
  { stage: "Novo", count: 42, color: "#FFD470" },
  { stage: "Qualificando", count: 35, color: "#3B82F6" },
  { stage: "Proposta", count: 18, color: "#8B5CF6" },
  { stage: "Negociando", count: 12, color: "#F59E0B" },
  { stage: "Fechado", count: 28, color: "#10B981" },
  { stage: "Perdido", count: 15, color: "#EF4444" },
];

function StageTag({ stage }: { stage: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Novo: { bg: "rgba(255,212,112,0.15)", text: "#FFD470" },
    Qualificando: { bg: "rgba(59,130,246,0.15)", text: "#3B82F6" },
    Proposta: { bg: "rgba(139,92,246,0.15)", text: "#8B5CF6" },
    Negociando: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B" },
    Fechado: { bg: "rgba(16,185,129,0.15)", text: "#10B981" },
    Perdido: { bg: "rgba(239,68,68,0.15)", text: "#EF4444" },
  };
  const c = colors[stage] ?? { bg: "#F2F3F6", text: "#56585E" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {stage}
    </span>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visão geral — Nexus Inovações Imobiliárias
        </p>
      </div>

      {/* Main stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, trend, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-elevated transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-display font-bold mt-1">{value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3 text-success" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-destructive" />
                    )}
                    <span className={`text-xs font-medium ${trend === "up" ? "text-success" : "text-destructive"}`}>
                      {change}
                    </span>
                  </div>
                </div>
                <div
                  className="rounded-xl p-2.5"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats2.map(({ label, value, sub, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-lg border bg-card p-4 flex items-center gap-3"
          >
            <div
              className="rounded-lg p-2 flex-shrink-0"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-display font-bold leading-tight">{value}</p>
              <p className="text-[11px] text-muted-foreground truncate">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent leads */}
        <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm">
          <div className="p-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-display font-semibold">Últimos Leads</h3>
            </div>
            <span className="text-xs text-muted-foreground">Tempo real</span>
          </div>
          <div className="divide-y">
            {recentLeads.map((lead) => (
              <div key={lead.phone} className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
                  {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                    <StageTag stage={lead.stage} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{lead.interest}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px] text-muted-foreground">{lead.time}</p>
                  <p className="text-[11px] font-medium" style={{ color: "var(--nexus-gold)" }}>{lead.agent}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Kanban Summary */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="p-5 border-b flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-display font-semibold">Funil de Vendas</h3>
            </div>
            <div className="p-5 space-y-3">
              {kanbanSummary.map(({ stage, count, color }) => (
                <div key={stage} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-sm flex-1">{stage}</span>
                  <span className="text-sm font-display font-bold">{count}</span>
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: color,
                        width: `${(count / 50) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Ranking */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="p-5 border-b flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-display font-semibold">Top Corretores</h3>
            </div>
            <div className="divide-y">
              {agentRanking.slice(0, 4).map((agent, i) => (
                <div key={agent.name} className="p-3 flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{
                      backgroundColor: i === 0 ? "var(--nexus-gold)" : "#F2F3F6",
                      color: i === 0 ? "var(--nexus-dark)" : "#56585E",
                    }}
                  >
                    {agent.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{agent.name}</p>
                    <p className="text-[11px] text-muted-foreground">{agent.conversions} fechados</p>
                  </div>
                  <span className="text-sm font-display font-bold" style={{ color: "var(--nexus-gold)" }}>
                    {agent.rate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
