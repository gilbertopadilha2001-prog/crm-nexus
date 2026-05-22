"use client";

import { useState } from "react";
import { Target, Users, RefreshCcw, Settings2, ArrowRight, Zap, Hand } from "lucide-react";

interface AgentQueue {
  id: string;
  name: string;
  avatar: string;
  leadsToday: number;
  leadsTotal: number;
  active: boolean;
  regions: string[];
}

const agents: AgentQueue[] = [
  { id: "1", name: "Carlos Mendes", avatar: "CM", leadsToday: 3, leadsTotal: 45, active: true, regions: ["Água Verde", "Batel", "Cristo Rei"] },
  { id: "2", name: "Ana Rodrigues", avatar: "AR", leadsToday: 2, leadsTotal: 38, active: true, regions: ["Santa Felicidade", "Boa Vista"] },
  { id: "3", name: "Pedro Lima", avatar: "PL", leadsToday: 4, leadsTotal: 42, active: true, regions: ["Pinheirinho", "Fazenda Rio Grande"] },
  { id: "4", name: "Julia Ferreira", avatar: "JF", leadsToday: 1, leadsTotal: 35, active: true, regions: ["Ecoville", "Mossunguê"] },
  { id: "5", name: "Bruno Souza", avatar: "BS", leadsToday: 2, leadsTotal: 30, active: true, regions: ["Campo Largo", "Colombo"] },
];

const pendingLeads = [
  { id: "p1", name: "Carolina Martins", phone: "(41) 99111-2233", interest: "Apto 2Q - Centro", time: "2 min" },
  { id: "p2", name: "Felipe Ramos", phone: "(41) 99222-3344", interest: "Casa 3Q - Boqueirão", time: "5 min" },
  { id: "p3", name: "Amanda Lopes", phone: "(41) 99333-4455", interest: "MCMV - Tatuquara", time: "8 min" },
];

export default function LeadDistributionPage() {
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [nextAgent, setNextAgent] = useState(0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Distribuição de Leads</h1>
          <p className="text-muted-foreground text-sm">
            {pendingLeads.length} leads aguardando distribuição
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("auto")}
            className={`inline-flex items-center gap-2 rounded-xl text-sm font-medium h-10 px-4 transition-colors ${
              mode === "auto" ? "font-semibold" : "border border-border bg-card hover:bg-muted"
            }`}
            style={mode === "auto" ? { backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" } : {}}
          >
            <Zap className="h-4 w-4" />
            Automático
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`inline-flex items-center gap-2 rounded-xl text-sm font-medium h-10 px-4 transition-colors ${
              mode === "manual" ? "font-semibold" : "border border-border bg-card hover:bg-muted"
            }`}
            style={mode === "manual" ? { backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" } : {}}
          >
            <Hand className="h-4 w-4" />
            Manual
          </button>
        </div>
      </div>

      {/* Auto mode config */}
      {mode === "auto" && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold">Configuração do Rodízio</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm font-medium mb-1">Método</p>
              <p className="text-xs text-muted-foreground">Round-robin (rodízio sequencial)</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm font-medium mb-1">Próximo da fila</p>
              <p className="text-xs font-semibold" style={{ color: "var(--nexus-gold)" }}>
                {agents[nextAgent].name}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm font-medium mb-1">Filtro por região</p>
              <p className="text-xs text-muted-foreground">Ativado — cada corretor recebe leads da sua área</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending leads */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-display font-semibold">Leads Pendentes</h3>
            </div>
            {mode === "auto" && (
              <button
                onClick={() => setNextAgent((prev) => (prev + 1) % agents.length)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}
              >
                <RefreshCcw className="h-3 w-3" />
                Distribuir Todos
              </button>
            )}
          </div>
          <div className="divide-y">
            {pendingLeads.map((lead) => (
              <div key={lead.id} className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
                  {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.interest}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">{lead.time}</span>
                {mode === "manual" && (
                  <select className="h-8 px-2 rounded-lg border border-border text-xs bg-card focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Escolher...</option>
                    {agents.filter(a => a.active).map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                )}
                {mode === "auto" && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
            {pendingLeads.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">Nenhum lead pendente</p>
              </div>
            )}
          </div>
        </div>

        {/* Agent queue */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-5 border-b flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold">Fila de Corretores</h3>
          </div>
          <div className="divide-y">
            {agents.map((agent, i) => (
              <div key={agent.id} className={`p-4 flex items-center gap-3 ${i === nextAgent && mode === "auto" ? "bg-primary/5" : ""}`}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    backgroundColor: i === nextAgent && mode === "auto" ? "var(--nexus-gold)" : "#F2F3F6",
                    color: i === nextAgent && mode === "auto" ? "var(--nexus-dark)" : "#56585E",
                  }}>
                  {agent.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{agent.name}</p>
                    {i === nextAgent && mode === "auto" && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,212,112,0.2)", color: "var(--nexus-gold)" }}>
                        Próximo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {agent.regions.join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-display font-bold">{agent.leadsToday}</p>
                  <p className="text-[10px] text-muted-foreground">hoje</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
