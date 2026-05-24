"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Send, Users, CheckCircle, Clock, Loader2, X, Trash2, FileText } from "lucide-react";

interface Broadcast {
  id: string;
  name: string;
  message: string;
  status: string;
  totalSent: number;
  totalFailed: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  _count: { recipients: number };
  agent: { id: string; name: string; avatar: string | null } | null;
}

const inputCls = "w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

const STATUS: Record<string, { label: string; color: string; Icon: typeof Clock }> = {
  draft:     { label: "Rascunho",  color: "#9CA3AF", Icon: FileText },
  scheduled: { label: "Agendado", color: "#3B82F6", Icon: Clock },
  sending:   { label: "Enviando", color: "#F59E0B", Icon: Send },
  sent:      { label: "Enviado",  color: "#10B981", Icon: CheckCircle },
  failed:    { label: "Falha",    color: "#EF4444", Icon: X },
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", message: "", phones: "", scheduledAt: "" });
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchBroadcasts = useCallback(async () => {
    const res = await fetch("/api/broadcasts");
    if (res.ok) setBroadcasts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchBroadcasts(); }, [fetchBroadcasts]);

  const handleCreate = async () => {
    if (!form.name || !form.message) return;
    setSaving(true);
    setFeedback(null);
    const phones = form.phones.split(/[\n,;]/).map((p) => p.trim()).filter(Boolean);
    const res = await fetch("/api/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        message: form.message,
        scheduledAt: form.scheduledAt || null,
        recipients: phones.map((p) => ({ phone: p })),
      }),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ name: "", message: "", phones: "", scheduledAt: "" });
      fetchBroadcasts();
    } else {
      const data = await res.json();
      setFeedback(data.error || "Erro ao criar");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover disparo?")) return;
    await fetch(`/api/broadcasts/${id}`, { method: "DELETE" });
    setBroadcasts((p) => p.filter((b) => b.id !== id));
  };

  const totalSent = broadcasts.reduce((s, b) => s + b.totalSent, 0);
  const totalDraft = broadcasts.filter((b) => b.status === "draft").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Disparos em Massa</h1>
          <p className="text-muted-foreground text-sm mt-1">{totalSent.toLocaleString()} mensagens enviadas · {totalDraft} rascunhos</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold h-9 px-4"
          style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
          <Plus className="h-4 w-4" /> Novo Disparo
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : broadcasts.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Send className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground">Nenhum disparo criado ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {broadcasts.map((b) => {
            const s = STATUS[b.status] || STATUS.draft;
            const StatusIcon = s.Icon;
            return (
              <div key={b.id} className="rounded-xl border bg-card shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{b.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{b.message}</p>
                  </div>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors ml-2 flex-shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                    <StatusIcon className="h-3 w-3" />{s.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Users className="h-3 w-3" />{b._count.recipients} destinatários
                  </span>
                </div>

                {b.status === "sent" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-success/10 p-2 text-center">
                      <p className="text-sm font-bold text-success">{b.totalSent}</p>
                      <p className="text-[10px] text-success/70">Enviados</p>
                    </div>
                    <div className="rounded-lg bg-destructive/10 p-2 text-center">
                      <p className="text-sm font-bold text-destructive">{b.totalFailed}</p>
                      <p className="text-[10px] text-destructive/70">Falhas</p>
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-muted-foreground border-t pt-2">
                  {b.sentAt ? `Enviado em ${fmtDate(b.sentAt)}` : b.scheduledAt ? `Agendado: ${fmtDate(b.scheduledAt)}` : `Criado em ${fmtDate(b.createdAt)}`}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display font-bold text-lg">Novo Disparo</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nome do disparo *</label>
                <input className={inputCls} placeholder="Ex: Lançamento MCMV Junho" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Mensagem *</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={4} placeholder="Olá! Temos novidades..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Destinatários (um por linha ou separados por vírgula)</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={3} placeholder="(41) 99999-0000&#10;(41) 98888-0000" value={form.phones} onChange={(e) => setForm({ ...form, phones: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Agendar para (opcional)</label>
                <input className={inputCls} type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
              </div>
              {feedback && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{feedback}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-xl border text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleCreate} disabled={saving || !form.name || !form.message}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Criar Disparo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
