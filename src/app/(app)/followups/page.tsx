"use client";

import { useState } from "react";
import { Plus, Clock, CheckCircle, AlertCircle, Calendar, Phone, MessageSquare, Search } from "lucide-react";

interface FollowUp {
  id: string;
  contactName: string;
  phone: string;
  message: string;
  scheduledAt: string;
  scheduledDate: string;
  agent: string;
  avatar: string;
  status: "pending" | "sent" | "failed";
  property: string;
}

const followups: FollowUp[] = [
  { id: "1", contactName: "Maria Silva", phone: "(41) 99876-5432", message: "Olá Maria! Tudo bem? Vi que você se interessou pelo apto na Água Verde. Posso agendar uma visita?", scheduledAt: "Hoje, 16:00", scheduledDate: "2026-05-22", agent: "Carlos", avatar: "MS", status: "pending", property: "Apto 2Q - Água Verde" },
  { id: "2", contactName: "Roberto Oliveira", phone: "(41) 96543-2109", message: "Boa tarde Roberto! O terreno em Campo Largo que conversamos ainda está disponível.", scheduledAt: "Hoje, 17:30", scheduledDate: "2026-05-22", agent: "Carlos", avatar: "RO", status: "pending", property: "Terreno - Campo Largo" },
  { id: "3", contactName: "Luciana Pereira", phone: "(41) 95432-1098", message: "Olá Luciana! Segue a proposta atualizada do apartamento no Batel.", scheduledAt: "Amanhã, 09:00", scheduledDate: "2026-05-23", agent: "Ana", avatar: "LP", status: "pending", property: "Apto 3Q - Batel" },
  { id: "4", contactName: "João Santos", phone: "(41) 98765-4321", message: "Olá João! Como está a análise das fotos que enviei?", scheduledAt: "Amanhã, 14:00", scheduledDate: "2026-05-23", agent: "Ana", avatar: "JS", status: "pending", property: "Casa 3Q - Sta. Felicidade" },
  { id: "5", contactName: "Fernanda Costa", phone: "(41) 97654-3210", message: "Parabéns pela aprovação Fernanda! Vamos agendar a assinatura?", scheduledAt: "Hoje, 11:00", scheduledDate: "2026-05-22", agent: "Pedro", avatar: "FC", status: "sent", property: "MCMV - Pinheirinho" },
  { id: "6", contactName: "Camila Rocha", phone: "(41) 93210-9876", message: "Olá Camila! Temos novidades sobre o MCMV em Fazenda Rio Grande.", scheduledAt: "Ontem, 15:00", scheduledDate: "2026-05-21", agent: "Pedro", avatar: "CR", status: "sent", property: "MCMV - Fazenda Rio Grande" },
  { id: "7", contactName: "André Lima", phone: "(41) 92109-8765", message: "André, lembrete: visita ao apto no Cristo Rei amanhã às 10h.", scheduledAt: "20/05, 09:00", scheduledDate: "2026-05-20", agent: "Ana", avatar: "AL", status: "failed", property: "Apto 2Q - Cristo Rei" },
];

function StatusBadge({ status }: { status: FollowUp["status"] }) {
  const config = {
    pending: { label: "Pendente", icon: Clock, bg: "rgba(255,212,112,0.15)", color: "#FFD470" },
    sent: { label: "Enviado", icon: CheckCircle, bg: "rgba(16,185,129,0.15)", color: "#10B981" },
    failed: { label: "Falhou", icon: AlertCircle, bg: "rgba(239,68,68,0.15)", color: "#EF4444" },
  };
  const c = config[status];
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: c.bg, color: c.color }}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

export default function FollowupsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "sent" | "failed">("all");

  const filtered = followups.filter((f) => {
    const matchSearch = f.contactName.toLowerCase().includes(search.toLowerCase()) || f.phone.includes(search);
    const matchFilter = filter === "all" || f.status === filter;
    return matchSearch && matchFilter;
  });

  const pendingCount = followups.filter(f => f.status === "pending").length;
  const todayCount = followups.filter(f => f.scheduledDate === "2026-05-22" && f.status === "pending").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Follow-ups</h1>
          <p className="text-muted-foreground text-sm">
            {pendingCount} pendentes — {todayCount} para hoje
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold h-10 px-5 transition-colors"
          style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
          <Plus className="h-4 w-4" />
          Novo Follow-up
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg p-2" style={{ backgroundColor: "rgba(255,212,112,0.1)" }}>
            <Clock className="h-4 w-4" style={{ color: "var(--nexus-gold)" }} />
          </div>
          <div>
            <p className="text-lg font-display font-bold">{todayCount}</p>
            <p className="text-[11px] text-muted-foreground">Agendados para hoje</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg p-2 bg-success/10"><CheckCircle className="h-4 w-4 text-success" /></div>
          <div>
            <p className="text-lg font-display font-bold">{followups.filter(f => f.status === "sent").length}</p>
            <p className="text-[11px] text-muted-foreground">Enviados com sucesso</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg p-2 bg-destructive/10"><AlertCircle className="h-4 w-4 text-destructive" /></div>
          <div>
            <p className="text-lg font-display font-bold">{followups.filter(f => f.status === "failed").length}</p>
            <p className="text-[11px] text-muted-foreground">Falharam</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-1 bg-card rounded-lg border p-1">
          {(["all", "pending", "sent", "failed"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              {f === "all" ? "Todos" : f === "pending" ? "Pendentes" : f === "sent" ? "Enviados" : "Falhos"}
            </button>
          ))}
        </div>
      </div>

      {/* Follow-up list */}
      <div className="space-y-3">
        {filtered.map((followup) => (
          <div key={followup.id} className="rounded-xl border bg-card shadow-sm hover:shadow-elevated transition-shadow p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
                {followup.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-display font-semibold text-sm">{followup.contactName}</p>
                  <StatusBadge status={followup.status} />
                </div>
                <p className="text-xs text-muted-foreground mb-2">{followup.property}</p>
                <div className="bg-muted/30 rounded-lg p-3 mb-2">
                  <p className="text-sm text-foreground">{followup.message}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {followup.scheduledAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {followup.phone}
                  </span>
                  <span style={{ color: "var(--nexus-gold)" }}>{followup.agent}</span>
                </div>
              </div>
              {followup.status === "failed" && (
                <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0">
                  Reenviar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
