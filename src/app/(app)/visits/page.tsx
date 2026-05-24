"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Plus, Home, User, X, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

interface Visit {
  id: string;
  scheduledAt: string;
  status: string;
  notes: string | null;
  lead: { id: string; name: string; phone: string } | null;
  property: { id: string; title: string; type: string; region: string; price: number } | null;
  agent: { id: string; name: string; avatar: string | null } | null;
}

interface Property { id: string; title: string; type: string; region: string; price: number; }
interface Lead { id: string; name: string; phone: string; }

const inputCls = "w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

const STATUS_MAP: Record<string, { label: string; color: string; Icon: typeof Clock }> = {
  scheduled: { label: "Agendada",  color: "#3B82F6", Icon: Clock },
  done:      { label: "Realizada", color: "#10B981", Icon: CheckCircle2 },
  cancelled: { label: "Cancelada", color: "#EF4444", Icon: XCircle },
};

function fmt(v: number) {
  if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}K`;
  return `R$ ${v}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"scheduled" | "done" | "cancelled" | "all">("scheduled");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [form, setForm] = useState({ leadId: "", propertyId: "", scheduledAt: "", notes: "" });

  const fetchVisits = useCallback(async () => {
    const params = filter === "all" ? "" : `?status=${filter}`;
    const res = await fetch(`/api/visits${params}`);
    if (res.ok) setVisits(await res.json());
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchVisits(); }, [fetchVisits]);

  const loadModalData = async () => {
    const [pRes, lRes] = await Promise.all([fetch("/api/properties"), fetch("/api/leads")]);
    if (pRes.ok) setProperties(await pRes.json());
    if (lRes.ok) setLeads(await lRes.json());
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!form.scheduledAt) return;
    setSaving(true);
    const res = await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ leadId: "", propertyId: "", scheduledAt: "", notes: "" });
      fetchVisits();
    }
    setSaving(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/visits/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchVisits();
  };

  const today = visits.filter((v) => new Date(v.scheduledAt).toDateString() === new Date().toDateString()).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Visitas</h1>
          <p className="text-muted-foreground text-sm mt-1">{today} visita{today !== 1 ? "s" : ""} para hoje</p>
        </div>
        <button onClick={loadModalData}
          className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold h-9 px-4"
          style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
          <Plus className="h-4 w-4" /> Agendar Visita
        </button>
      </div>

      <div className="flex gap-1 bg-card rounded-lg border p-1 w-fit">
        {(["scheduled", "done", "cancelled", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {f === "all" ? "Todas" : STATUS_MAP[f]?.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : visits.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground">Nenhuma visita encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visits.map((visit) => {
            const s = STATUS_MAP[visit.status] || STATUS_MAP.scheduled;
            const StatusIcon = s.Icon;
            return (
              <div key={visit.id} className="rounded-xl border bg-card shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                    <StatusIcon className="h-3 w-3" />{s.label}
                  </span>
                  <p className="text-xs text-muted-foreground">{fmtDate(visit.scheduledAt)}</p>
                </div>
                {visit.property && (
                  <div className="flex items-start gap-2">
                    <Home className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--nexus-gold)" }} />
                    <div>
                      <p className="text-sm font-medium">{visit.property.title}</p>
                      <p className="text-xs text-muted-foreground">{visit.property.region} · {fmt(visit.property.price)}</p>
                    </div>
                  </div>
                )}
                {visit.lead && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm">{visit.lead.name}</p>
                      <p className="text-xs text-muted-foreground">{visit.lead.phone}</p>
                    </div>
                  </div>
                )}
                {visit.notes && <p className="text-xs text-muted-foreground border-t pt-2">{visit.notes}</p>}
                {visit.status === "scheduled" && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => updateStatus(visit.id, "done")}
                      className="flex-1 h-8 rounded-lg text-xs font-medium bg-success/10 text-success hover:bg-success/20 transition-colors">Realizada</button>
                    <button onClick={() => updateStatus(visit.id, "cancelled")}
                      className="flex-1 h-8 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">Cancelar</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display font-bold text-lg">Agendar Visita</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Imóvel</label>
                <select className={inputCls} value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })}>
                  <option value="">Selecionar imóvel...</option>
                  {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Lead</label>
                <select className={inputCls} value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })}>
                  <option value="">Selecionar lead...</option>
                  {leads.map((l) => <option key={l.id} value={l.id}>{l.name} · {l.phone}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Data e hora *</label>
                <input className={inputCls} type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Observações</label>
                <input className={inputCls} placeholder="Notas sobre a visita..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-xl border text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleCreate} disabled={saving || !form.scheduledAt}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Agendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
