"use client";

import { useState } from "react";
import { Plus, Phone, DollarSign, User, GripVertical, Home } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  property: string;
  value: number;
  agent: string;
  stage: string;
  daysInStage: number;
}

const stages = [
  { id: "novo", name: "Novo", color: "#FFD470" },
  { id: "qualificando", name: "Qualificando", color: "#3B82F6" },
  { id: "proposta", name: "Proposta", color: "#8B5CF6" },
  { id: "negociando", name: "Negociando", color: "#F59E0B" },
  { id: "fechado", name: "Fechado", color: "#10B981" },
  { id: "perdido", name: "Perdido", color: "#EF4444" },
];

const initialLeads: Lead[] = [
  { id: "1", name: "Maria Silva", phone: "(41) 99876-5432", property: "Apto 2Q - Água Verde", value: 320000, agent: "Carlos", stage: "novo", daysInStage: 0 },
  { id: "2", name: "João Santos", phone: "(41) 98765-4321", property: "Casa 3Q - Sta. Felicidade", value: 580000, agent: "Ana", stage: "novo", daysInStage: 1 },
  { id: "3", name: "Pedro Alves", phone: "(41) 97111-2233", property: "MCMV - Pinheirinho", value: 195000, agent: "Pedro", stage: "novo", daysInStage: 2 },
  { id: "4", name: "Fernanda Costa", phone: "(41) 97654-3210", property: "Apto 3Q - Cabral", value: 450000, agent: "Ana", stage: "qualificando", daysInStage: 3 },
  { id: "5", name: "Roberto Oliveira", phone: "(41) 96543-2109", property: "Terreno - Campo Largo", value: 150000, agent: "Carlos", stage: "qualificando", daysInStage: 5 },
  { id: "6", name: "Luciana Pereira", phone: "(41) 95432-1098", property: "Apto 3Q - Batel", value: 890000, agent: "Julia", stage: "proposta", daysInStage: 2 },
  { id: "7", name: "Marco Vieira", phone: "(41) 94321-0987", property: "Casa 4Q - Ecoville", value: 1200000, agent: "Bruno", stage: "proposta", daysInStage: 4 },
  { id: "8", name: "Camila Rocha", phone: "(41) 93210-9876", property: "MCMV - Fazenda Rio Grande", value: 185000, agent: "Pedro", stage: "negociando", daysInStage: 7 },
  { id: "9", name: "André Lima", phone: "(41) 92109-8765", property: "Apto 2Q - Cristo Rei", value: 380000, agent: "Ana", stage: "negociando", daysInStage: 10 },
  { id: "10", name: "Patricia Santos", phone: "(41) 91098-7654", property: "Casa 3Q - Boa Vista", value: 420000, agent: "Carlos", stage: "fechado", daysInStage: 0 },
  { id: "11", name: "Ricardo Nunes", phone: "(41) 90987-6543", property: "Terreno - Colombo", value: 95000, agent: "Bruno", stage: "perdido", daysInStage: 0 },
];

function formatCurrency(value: number) {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}K`;
  return `R$ ${value}`;
}

export default function CrmPage() {
  const [leads, setLeads] = useState(initialLeads);
  const [draggedLead, setDraggedLead] = useState<string | null>(null);

  const handleDragStart = (leadId: string) => {
    setDraggedLead(leadId);
  };

  const handleDrop = (targetStage: string) => {
    if (!draggedLead) return;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === draggedLead ? { ...l, stage: targetStage, daysInStage: 0 } : l
      )
    );
    setDraggedLead(null);
  };

  const getStageLeads = (stageId: string) => leads.filter((l) => l.stage === stageId);
  const getStageValue = (stageId: string) =>
    leads.filter((l) => l.stage === stageId).reduce((sum, l) => sum + l.value, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">CRM Kanban</h1>
          <p className="text-muted-foreground text-sm">
            {leads.length} leads no funil — Total: {formatCurrency(leads.reduce((s, l) => s + l.value, 0))}
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold h-10 px-5 transition-colors"
          style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}
        >
          <Plus className="h-4 w-4" />
          Novo Lead
        </button>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
        {stages.map(({ id, name, color }) => {
          const stageLeads = getStageLeads(id);
          const stageValue = getStageValue(id);

          return (
            <div key={id} className="flex-shrink-0 w-72">
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <h3 className="text-sm font-display font-semibold">{name}</h3>
                <span className="ml-auto inline-flex items-center rounded-full text-xs px-2 py-0.5 font-bold"
                  style={{ backgroundColor: `${color}20`, color }}>
                  {stageLeads.length}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2 px-1">
                {formatCurrency(stageValue)}
              </p>

              {/* Drop zone */}
              <div
                className={`min-h-[calc(100vh-280px)] rounded-xl border-2 border-dashed transition-colors p-2 space-y-2 ${
                  draggedLead ? "border-primary/40 bg-primary/5" : "border-border"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(id);
                }}
              >
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    onDragEnd={() => setDraggedLead(null)}
                    className="bg-card rounded-xl border shadow-sm p-3 cursor-grab active:cursor-grabbing hover:shadow-elevated transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        <p className="text-sm font-medium truncate">{lead.name}</p>
                      </div>
                      {lead.daysInStage > 5 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium flex-shrink-0">
                          {lead.daysInStage}d
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Home className="h-3 w-3" />
                        <span className="truncate">{lead.property}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{lead.phone}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--nexus-gold)" }}>
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(lead.value)}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <User className="h-3 w-3" />
                          {lead.agent}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-xs text-muted-foreground">Arraste leads aqui</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
