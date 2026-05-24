"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Plus, CheckCircle2, X, Loader2, Phone, MessageSquare, Calendar } from "lucide-react";

interface FollowUp {
  id: string;
  type: string;
  notes: string | null;
  scheduledAt: string;
  done: boolean;
  doneAt: string | null;
  lead: { id: string; name: string; phone: string; stage: string } | null;
  agent: { id: string; name: string; avatar: string | null } | null;
}

const inputCls = "w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

const TYPE_ICONS: Record<string, typeof Phone> = { call: Phone, message: MessageSquare, visit: Calendar };
const TYPE_LABELS: Record<string, string> = { call: "Ligar", message: "Mensagem", visit: "Visita" };

function fmtDate(d: string) {
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function isOverdue(d: string, done: boolean) {
  return !done && new Date(d) < new Date();
}

export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "done" | "all">("pending");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: "call", notes: "", scheduledAt: "" });

  const fetchItems = useCallback(async () => {
    const params = filter === "all" ? "" : `?done=${filter === "done"}`;
    const res = await fetch(`/api/followups${params}`);
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const toggleDone = async (item: FollowUp) => {
    const res = await fetch(`/api/followups/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !item.done }),
    });
    if (res.ok) fetchItems();
  };

  const handleCreate = async () => {
    if (!form.scheduledAt) return;
    setSaving(true);
    const res = await fetch("/api/followups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ type: "call", notes: "", scheduledAt: "" });
      fetchItems();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/followups/${id}`, { method: "DELETE" });
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const today = items.filter((i) => !i.done && new Date(i.scheduledAt).toDateString() === new Date().toDateString()).length;
  const overdue = items.filter((i) => isOverdue(i.scheduledAt, i.done)).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Follow-ups</h1>
          <p className="text-muted-foreground text-sm mt-1">{today} para hoje · {overdue} atrasados</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold h-9 px-4"
          style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
          <Plus className="h-4 w-4" /> Novo Follow-up
        </button>
      </div>

      <div className="flex gap-1 bg-card rounded-lg border p-1 w-fit">
        {(["pending", "done", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {f === "pending" ? "Pendentes" : f === "done" ? "Concluídos" : "Todos"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground">Nenhum follow-up encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = TYPE_ICONS[item.type] || Phone;
            const overdueCls = isOverdue(item.scheduledAt, item.done);
            return (
              <div key={item.id} className={`rounded-xl border bg-card p-4 flex items-center gap-3 transition-opacity ${item.done ? "opacity-60" : ""}`}>
                <button onClick={() => toggleDone(item)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    item.done ? "bg-success border-success" : overdueCls ? "border-destructive" : "border-muted-foreground hover:border-success"
                  }`}>
                  {item.done && <CheckCircle2 className="h-4 w-4 text-white" />}
                </button>
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: overdueCls ? "rgba(239,68,68,0.1)" : "rgba(255,212,112,0.15)" }}>
                  <Icon className="h-4 w-4" style={{ color: overdueCls ? "#EF4444" : "var(--nexus-gold)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${item.done ? "line-through text-muted-foreground" : ""}`}>
                      {TYPE_LABELS[item.type] || item.type}
                      {item.lead && <span className="ml-1 font-normal text-muted-foreground">→ {item.lead.name}</span>}
                    </p>
                  </div>
                  {item.notes && <p className="text-xs text-muted-foreground truncate">{item.notes}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-xs font-medium ${overdueCls ? "text-destructive" : "text-muted-foreground"}`}>{fmtDate(item.scheduledAt)}</p>
                  {item.agent && <p className="text-[11px] text-muted-foreground">{item.agent.name.split(" ")[0]}</p>}
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display font-bold text-lg">Novo Follow-up</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tipo</label>
                <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="call">Ligar</option>
                  <option value="message">Mensagem</option>
                  <option value="visit">Visita</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Data e hora *</label>
                <input className={inputCls} type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Observações</label>
                <input className={inputCls} placeholder="O que precisa ser feito..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-xl border text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleCreate} disabled={saving || !form.scheduledAt}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
