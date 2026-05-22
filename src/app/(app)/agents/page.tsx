"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Phone,
  Mail,
  MoreVertical,
  Edit2,
  Trash2,
  MessageSquare,
  X,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  creci: string;
  avatar: string;
  status: "active" | "inactive";
  leads: number;
  conversions: number;
  whatsappConnected: boolean;
}

const mockAgents: Agent[] = [
  { id: "1", name: "Carlos Mendes", phone: "(41) 99999-0001", email: "carlos@nexusimoveis.com.br", creci: "F-45231", avatar: "CM", status: "active", leads: 45, conversions: 12, whatsappConnected: true },
  { id: "2", name: "Ana Rodrigues", phone: "(41) 99999-0002", email: "ana@nexusimoveis.com.br", creci: "F-38921", avatar: "AR", status: "active", leads: 38, conversions: 9, whatsappConnected: true },
  { id: "3", name: "Pedro Lima", phone: "(41) 99999-0003", email: "pedro@nexusimoveis.com.br", creci: "F-52018", avatar: "PL", status: "active", leads: 42, conversions: 8, whatsappConnected: true },
  { id: "4", name: "Julia Ferreira", phone: "(41) 99999-0004", email: "julia@nexusimoveis.com.br", creci: "F-61432", avatar: "JF", status: "active", leads: 35, conversions: 6, whatsappConnected: false },
  { id: "5", name: "Bruno Souza", phone: "(41) 99999-0005", email: "bruno@nexusimoveis.com.br", creci: "F-73245", avatar: "BS", status: "active", leads: 30, conversions: 4, whatsappConnected: true },
  { id: "6", name: "Mariana Alves", phone: "(41) 99999-0006", email: "mariana@nexusimoveis.com.br", creci: "F-44821", avatar: "MA", status: "inactive", leads: 18, conversions: 3, whatsappConnected: false },
];

export default function AgentsPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = mockAgents.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.creci.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || a.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Corretores</h1>
          <p className="text-muted-foreground text-sm">
            {mockAgents.filter(a => a.status === "active").length} ativos de {mockAgents.length} cadastrados
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold h-10 px-5 transition-colors"
          style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}
        >
          <Plus className="h-4 w-4" />
          Novo Corretor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou CRECI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1 bg-card rounded-lg border p-1">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "Todos" : f === "active" ? "Ativos" : "Inativos"}
            </button>
          ))}
        </div>
      </div>

      {/* Agent cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((agent) => (
          <div key={agent.id} className="rounded-xl border bg-card shadow-sm hover:shadow-elevated transition-shadow">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      backgroundColor: agent.status === "active" ? "var(--nexus-gold)" : "#F2F3F6",
                      color: agent.status === "active" ? "var(--nexus-dark)" : "#56585E",
                    }}
                  >
                    {agent.avatar}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">CRECI {agent.creci}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      agent.status === "active"
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${agent.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
                    {agent.status === "active" ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{agent.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{agent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MessageSquare className="h-3.5 w-3.5" style={{ color: agent.whatsappConnected ? "#25D366" : "#9CA3AF" }} />
                  <span style={{ color: agent.whatsappConnected ? "#25D366" : "#9CA3AF" }}>
                    {agent.whatsappConnected ? "WhatsApp conectado" : "WhatsApp desconectado"}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 pt-3 border-t">
                <div>
                  <p className="text-lg font-display font-bold">{agent.leads}</p>
                  <p className="text-[11px] text-muted-foreground">Leads</p>
                </div>
                <div>
                  <p className="text-lg font-display font-bold">{agent.conversions}</p>
                  <p className="text-[11px] text-muted-foreground">Fechados</p>
                </div>
                <div>
                  <p className="text-lg font-display font-bold" style={{ color: "var(--nexus-gold)" }}>
                    {agent.leads > 0 ? `${((agent.conversions / agent.leads) * 100).toFixed(1)}%` : "0%"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Conversão</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t px-5 py-3 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                <Edit2 className="h-3.5 w-3.5" />
                Editar
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive py-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Agent Modal placeholder */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display font-bold text-lg">Novo Corretor</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nome completo</label>
                <input className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Ex: Maria Silva" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Telefone</label>
                  <input className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="(41) 99999-0000" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">CRECI</label>
                  <input className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="F-00000" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="corretor@nexusimoveis.com.br" type="email" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold transition-colors"
                  style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}
                >
                  Cadastrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
