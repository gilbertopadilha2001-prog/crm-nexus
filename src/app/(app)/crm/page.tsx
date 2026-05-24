"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Phone, DollarSign, User, GripVertical, Home, Loader2, X, Search } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  stage: string;
  value: number | null;
  interest: string | null;
  daysInStage: number;
  agent: { id: string; name: string; avatar: string | null } | null;
  property: { id: string; title: string; type: string; region: string } | null;
}

const stages = [
  { id: "novo",        name: "Novo",        color: "#FFD470" },
  { id: "qualificando",name: "Qualificando",color: "#3B82F6" },
  { id: "proposta",    name: "Proposta",    color: "#8B5CF6" },
  { id: "negociando",  name: "Negociando",  color: "#F59E0B" },
  { id: "fechado",     name: "Fechado",     color: "#10B981" },
  { id: "perdido",     name: "Perdido",     color: "#EF4444" },
];

function fmt(v: number | null) {
  if (!v) return null;
  if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}K`;
  return `R$ ${v}`;
}

const inputCls = "w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({ name: "", phone: "", email: "", value: "", notes: "", stage: "novo" });

  const fetchLeads = useCallback(async () => {
    const res = await fetch("/api/leads");
    if (res.ok) setLeads(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleDrop = async (targetStage: string) => {
    if (!draggedId || leads.find((l) => l.id === draggedId)?.stage === targetStage) return;

    setLeads((prev) => prev.map((l) => l.id === draggedId ? { ...l, stage: targetStage, daysInStage: 0 } : l));

    await fetch(`/api/leads/${draggedId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: targetStage }),
    });

    setDraggedId(null);
  };

  const handleCreate = async () => {
    if (!form.name || !form.phone) return;
    setSaving(true);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, value: form.value ? Number(form.value) : null }),
    });
    if (res.ok) {
      const lead = await res.json();
      setLeads((prev) => [lead, ...prev]);
      setShowModal(false);
      setForm({ name: "", phone: "", email: "", value: "", notes: "", stage: "novo" });
    }
    setSaving(false);
  };

  const filtered = search
    ? leads.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search))
    : leads;

  const getStageLeads = (stageId: string) => filtered.filter((l) => l.stage === stageId);
  const getStageValue = (stageId: string) => filtered.filter((l) => l.stage === stageId).reduce((s, l) => s + (l.value || 0), 0);
  const totalValue = leads.reduce((s, l) => s + (l.value || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold">CRM Kanban</h1>
          <p className="text-muted-foreground text-sm">{leads.length} leads — Total: {fmt(totalValue)}</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input className="h-9 pl-9 pr-3 rounded-lg border bg-card text-sm w-52 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Buscar lead..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold h-9 px-4 transition-colors"
            style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
            <Plus className="h-4 w-4" /> Novo Lead
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
        {stages.map(({ id, name, color }) => {
          const stageLeads = getStageLeads(id);
          const stageValue = getStageValue(id);
          return (
            <div key={id} className="flex-shrink-0 w-72">
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <h3 className="text-sm font-display font-semibold">{name}</h3>
                <span className="ml-auto inline-flex items-center rounded-full text-xs px-2 py-0.5 font-bold"
                  style={{ backgroundColor: `${color}20`, color }}>{stageLeads.length}</span>
              </div>
              {stageValue > 0 && (
                <p className="text-[11px] text-muted-foreground mb-2 px-1">{fmt(stageValue)}</p>
              )}
              <div
                className={`min-h-[calc(100vh-280px)] rounded-xl border-2 border-dashed transition-colors p-2 space-y-2 ${
                  draggedId ? "border-primary/40 bg-primary/5" : "border-border"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleDrop(id); }}
              >
                {stageLeads.map((lead) => {
                  const interest = lead.interest ? JSON.parse(lead.interest) : null;
                  return (
                    <div key={lead.id} draggable
                      onDragStart={() => setDraggedId(lead.id)}
                      onDragEnd={() => setDraggedId(null)}
                      className="bg-card rounded-xl border shadow-sm p-3 cursor-grab active:cursor-grabbing hover:shadow-elevated transition-shadow group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                          <p className="text-sm font-medium truncate">{lead.name}</p>
                        </div>
                        {lead.daysInStage > 5 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium flex-shrink-0">
                            {lead.daysInStage}d
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {interest?.type && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Home className="h-3 w-3" />
                            <span className="truncate">{interest.type} — {interest.region}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{lead.phone}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          {lead.value ? (
                            <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--nexus-gold)" }}>
                              <DollarSign className="h-3 w-3" />{fmt(lead.value)}
                            </div>
                          ) : <div />}
                          {lead.agent && (
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <User className="h-3 w-3" />{lead.agent.name.split(" ")[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {stageLeads.length === 0 && (
                  <div className="py-8 text-center"><p className="text-xs text-muted-foreground">Arraste leads aqui</p></div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display font-bold text-lg">Novo Lead</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nome *</label>
                <input className={inputCls} placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Telefone *</label>
                <input className={inputCls} placeholder="(41) 99999-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Valor estimado</label>
                  <input className={inputCls} type="number" placeholder="320000" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Etapa</label>
                  <select className={inputCls} value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                    {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Observações</label>
                <input className={inputCls} placeholder="Interesse, região..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-xl border text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleCreate} disabled={saving || !form.name || !form.phone}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Criar Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
