"use client";

import { useState } from "react";
import { Clock, Search, Phone, MessageSquare, AlertTriangle, Filter } from "lucide-react";

interface RecentContact {
  id: string;
  name: string;
  phone: string;
  interest: string;
  lastContact: string;
  lastContactDate: string;
  agent: string;
  avatar: string;
  stage: string;
  daysWithoutContact: number;
}

const contacts: RecentContact[] = [
  { id: "1", name: "Maria Silva", phone: "(41) 99876-5432", interest: "Apto 2Q - Água Verde", lastContact: "Hoje, 14:45", lastContactDate: "2026-05-22", agent: "Carlos", avatar: "MS", stage: "Novo", daysWithoutContact: 0 },
  { id: "2", name: "João Santos", phone: "(41) 98765-4321", interest: "Casa 3Q - Sta. Felicidade", lastContact: "Hoje, 13:30", lastContactDate: "2026-05-22", agent: "Ana", avatar: "JS", stage: "Qualificando", daysWithoutContact: 0 },
  { id: "3", name: "Fernanda Costa", phone: "(41) 97654-3210", interest: "MCMV - Pinheirinho", lastContact: "Hoje, 12:00", lastContactDate: "2026-05-22", agent: "Pedro", avatar: "FC", stage: "Proposta", daysWithoutContact: 0 },
  { id: "4", name: "Roberto Oliveira", phone: "(41) 96543-2109", interest: "Terreno - Campo Largo", lastContact: "Ontem, 16:20", lastContactDate: "2026-05-21", agent: "Carlos", avatar: "RO", stage: "Qualificando", daysWithoutContact: 1 },
  { id: "5", name: "Luciana Pereira", phone: "(41) 95432-1098", interest: "Apto 3Q - Batel", lastContact: "20/05, 09:30", lastContactDate: "2026-05-20", agent: "Ana", avatar: "LP", stage: "Negociando", daysWithoutContact: 2 },
  { id: "6", name: "Marco Vieira", phone: "(41) 94321-0987", interest: "Casa 4Q - Ecoville", lastContact: "18/05, 15:00", lastContactDate: "2026-05-18", agent: "Bruno", avatar: "MV", stage: "Proposta", daysWithoutContact: 4 },
  { id: "7", name: "Camila Rocha", phone: "(41) 93210-9876", interest: "MCMV - Fazenda Rio Grande", lastContact: "15/05, 10:00", lastContactDate: "2026-05-15", agent: "Pedro", avatar: "CR", stage: "Negociando", daysWithoutContact: 7 },
  { id: "8", name: "André Lima", phone: "(41) 92109-8765", interest: "Apto 2Q - Cristo Rei", lastContact: "12/05, 11:00", lastContactDate: "2026-05-12", agent: "Ana", avatar: "AL", stage: "Qualificando", daysWithoutContact: 10 },
  { id: "9", name: "Patricia Santos", phone: "(41) 91098-7654", interest: "Casa 3Q - Boa Vista", lastContact: "08/05, 14:00", lastContactDate: "2026-05-08", agent: "Carlos", avatar: "PS", stage: "Novo", daysWithoutContact: 14 },
];

function StageTag({ stage }: { stage: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Novo: { bg: "rgba(255,212,112,0.15)", text: "#FFD470" },
    Qualificando: { bg: "rgba(59,130,246,0.15)", text: "#3B82F6" },
    Proposta: { bg: "rgba(139,92,246,0.15)", text: "#8B5CF6" },
    Negociando: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B" },
  };
  const c = colors[stage] ?? { bg: "#F2F3F6", text: "#56585E" };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: c.bg, color: c.text }}>
      {stage}
    </span>
  );
}

function UrgencyBadge({ days }: { days: number }) {
  if (days === 0) return <span className="text-xs text-success font-medium">Hoje</span>;
  if (days <= 2) return <span className="text-xs text-muted-foreground">{days}d atrás</span>;
  if (days <= 5) return <span className="text-xs text-warning font-medium">{days}d atrás</span>;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-destructive font-semibold">
      <AlertTriangle className="h-3 w-3" />
      {days}d sem contato
    </span>
  );
}

export default function RecentContactsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "urgent" | "today">("all");

  const filtered = contacts
    .filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
      if (filter === "urgent") return matchSearch && c.daysWithoutContact >= 5;
      if (filter === "today") return matchSearch && c.daysWithoutContact === 0;
      return matchSearch;
    })
    .sort((a, b) => b.daysWithoutContact - a.daysWithoutContact);

  const urgentCount = contacts.filter(c => c.daysWithoutContact >= 5).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Últimos Contatos</h1>
          <p className="text-muted-foreground text-sm">
            {contacts.length} leads — <span className="text-destructive font-medium">{urgentCount} precisam de atenção</span>
          </p>
        </div>
      </div>

      {/* Alert banner */}
      {urgentCount > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">{urgentCount} leads sem contato há mais de 5 dias</p>
            <p className="text-xs text-muted-foreground">Leads sem contato perdem interesse rapidamente. Priorize esses contatos!</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar por nome ou telefone..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-1 bg-card rounded-lg border p-1">
          {([
            { key: "all", label: "Todos" },
            { key: "urgent", label: `Urgentes (${urgentCount})` },
            { key: "today", label: "Hoje" },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left font-medium text-muted-foreground p-3 pl-5">Lead</th>
                <th className="text-left font-medium text-muted-foreground p-3">Interesse</th>
                <th className="text-left font-medium text-muted-foreground p-3">Etapa</th>
                <th className="text-left font-medium text-muted-foreground p-3">Corretor</th>
                <th className="text-left font-medium text-muted-foreground p-3">Último contato</th>
                <th className="text-left font-medium text-muted-foreground p-3">Status</th>
                <th className="text-right font-medium text-muted-foreground p-3 pr-5">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((contact) => (
                <tr key={contact.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 pl-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: contact.daysWithoutContact >= 5 ? "rgba(239,68,68,0.15)" : "var(--nexus-gold)", color: contact.daysWithoutContact >= 5 ? "#EF4444" : "var(--nexus-dark)" }}>
                        {contact.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="text-sm truncate max-w-[180px]">{contact.interest}</p>
                  </td>
                  <td className="p-3"><StageTag stage={contact.stage} /></td>
                  <td className="p-3">
                    <p className="text-sm" style={{ color: "var(--nexus-gold)" }}>{contact.agent}</p>
                  </td>
                  <td className="p-3">
                    <p className="text-xs text-muted-foreground">{contact.lastContact}</p>
                  </td>
                  <td className="p-3"><UrgencyBadge days={contact.daysWithoutContact} /></td>
                  <td className="p-3 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Ligar">
                        <Phone className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="WhatsApp">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
