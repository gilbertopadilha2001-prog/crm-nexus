"use client";

import { useState } from "react";
import { Plus, Send, Users, CheckCircle, Eye, Clock, BarChart3, FileText } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  message: string;
  audience: string;
  audienceCount: number;
  sentAt: string;
  status: "draft" | "sending" | "sent" | "failed";
  delivered: number;
  read: number;
  total: number;
}

const campaigns: Campaign[] = [
  { id: "1", name: "Novos imóveis - Água Verde", message: "Olá! Temos novos apartamentos disponíveis na Água Verde com condições especiais...", audience: "Interessados em Água Verde", audienceCount: 85, sentAt: "Hoje, 10:00", status: "sent", delivered: 82, read: 45, total: 85 },
  { id: "2", name: "Promoção MCMV - Maio", message: "Aproveite as condições especiais do programa Minha Casa Minha Vida...", audience: "Leads MCMV", audienceCount: 120, sentAt: "20/05, 09:00", status: "sent", delivered: 115, read: 78, total: 120 },
  { id: "3", name: "Follow-up Visitas", message: "Olá! Como foi sua visita ao imóvel? Gostaríamos de saber sua opinião...", audience: "Visitantes últimos 7 dias", audienceCount: 23, sentAt: "18/05, 14:00", status: "sent", delivered: 23, read: 19, total: 23 },
  { id: "4", name: "Lançamento Ecoville", message: "Conheça o novo empreendimento no Ecoville! Unidades a partir de...", audience: "Todos os leads", audienceCount: 247, sentAt: "", status: "draft", delivered: 0, read: 0, total: 247 },
];

function StatusBadge({ status }: { status: Campaign["status"] }) {
  const config = {
    draft: { label: "Rascunho", bg: "rgba(107,114,128,0.15)", color: "#6B7280" },
    sending: { label: "Enviando...", bg: "rgba(59,130,246,0.15)", color: "#3B82F6" },
    sent: { label: "Enviado", bg: "rgba(16,185,129,0.15)", color: "#10B981" },
    failed: { label: "Falhou", bg: "rgba(239,68,68,0.15)", color: "#EF4444" },
  };
  const c = config[status];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

export default function BroadcastsPage() {
  const [showNew, setShowNew] = useState(false);

  const totalSent = campaigns.filter(c => c.status === "sent").reduce((s, c) => s + c.total, 0);
  const totalDelivered = campaigns.filter(c => c.status === "sent").reduce((s, c) => s + c.delivered, 0);
  const totalRead = campaigns.filter(c => c.status === "sent").reduce((s, c) => s + c.read, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Disparos</h1>
          <p className="text-muted-foreground text-sm">Envio em massa via WhatsApp</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold h-10 px-5 transition-colors"
          style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
          <Plus className="h-4 w-4" />
          Nova Campanha
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg p-2 bg-primary/10"><Send className="h-4 w-4 text-primary" /></div>
          <div>
            <p className="text-lg font-display font-bold">{totalSent}</p>
            <p className="text-[11px] text-muted-foreground">Total enviados</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg p-2 bg-success/10"><CheckCircle className="h-4 w-4 text-success" /></div>
          <div>
            <p className="text-lg font-display font-bold">{totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0}%</p>
            <p className="text-[11px] text-muted-foreground">Taxa de entrega</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg p-2 bg-info/10"><Eye className="h-4 w-4 text-info" /></div>
          <div>
            <p className="text-lg font-display font-bold">{totalSent > 0 ? ((totalRead / totalSent) * 100).toFixed(1) : 0}%</p>
            <p className="text-[11px] text-muted-foreground">Taxa de leitura</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="rounded-lg p-2 bg-warning/10"><FileText className="h-4 w-4 text-warning" /></div>
          <div>
            <p className="text-lg font-display font-bold">{campaigns.length}</p>
            <p className="text-[11px] text-muted-foreground">Campanhas</p>
          </div>
        </div>
      </div>

      {/* Campaigns list */}
      <div className="space-y-3">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="rounded-xl border bg-card shadow-sm hover:shadow-elevated transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold">{campaign.name}</h3>
                    <StatusBadge status={campaign.status} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{campaign.message}</p>
                </div>
                {campaign.sentAt && (
                  <span className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {campaign.sentAt}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {campaign.audience} ({campaign.audienceCount})
                </span>
                {campaign.status === "sent" && (
                  <>
                    <span className="text-success font-medium">{campaign.delivered} entregues</span>
                    <span className="font-medium" style={{ color: "var(--nexus-gold)" }}>{campaign.read} lidos</span>
                  </>
                )}
              </div>
              {campaign.status === "sent" && (
                <div className="mt-3 flex gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Entrega</span>
                      <span>{((campaign.delivered / campaign.total) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-success" style={{ width: `${(campaign.delivered / campaign.total) * 100}%` }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Leitura</span>
                      <span>{((campaign.read / campaign.total) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(campaign.read / campaign.total) * 100}%`, backgroundColor: "var(--nexus-gold)" }} />
                    </div>
                  </div>
                </div>
              )}
              {campaign.status === "draft" && (
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 h-9 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
                    Editar
                  </button>
                  <button className="flex-1 h-9 rounded-lg text-xs font-semibold transition-colors"
                    style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
                    Enviar Agora
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
