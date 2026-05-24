"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Users, MessageSquare, Zap, Upload, Download, Plus, Search, X, Loader2, Trash2 } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string | null;
  tags: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  agent: { id: string; name: string; avatar: string | null } | null;
}

const inputCls = "w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
const btnOutline = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-3 transition-colors";
const btnPrimary = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 transition-colors";

function parseTags(tags: string | null): string[] {
  if (!tags) return [];
  try { return JSON.parse(tags); } catch { return []; }
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", source: "manual", tags: "", notes: "" });
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContacts = useCallback(async () => {
    const params = search ? `?q=${encodeURIComponent(search)}` : "";
    const res = await fetch(`/api/contacts${params}`);
    if (res.ok) {
      const data = await res.json();
      setContacts(data.contacts);
      setTotal(data.total);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchContacts, 300);
    return () => clearTimeout(t);
  }, [fetchContacts]);

  const handleCreate = async () => {
    if (!form.name || !form.phone) return;
    setSaving(true);
    setFeedback(null);
    const tags = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tags }),
    });
    const data = await res.json();
    if (res.ok) {
      setContacts((prev) => [data, ...prev]);
      setTotal((t) => t + 1);
      setShowModal(false);
      setForm({ name: "", phone: "", email: "", source: "manual", tags: "", notes: "" });
    } else {
      setFeedback(data.error || "Erro ao salvar");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover contato?")) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setTotal((t) => t - 1);
  };

  const handleExport = () => {
    const rows = [["Nome", "Telefone", "Email", "Origem", "Tags"]];
    contacts.forEach((c) => rows.push([c.name, c.phone, c.email || "", c.source || "", parseTags(c.tags).join("; ")]));
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "contatos.csv";
    a.click();
  };

  const openWhatsApp = (phone: string) => {
    const num = phone.replace(/\D/g, "");
    window.open(`https://wa.me/55${num}`, "_blank");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <input ref={fileInputRef} type="file" accept=".csv" className="hidden" />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Contatos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie sua base de contatos WhatsApp</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className={btnOutline} onClick={handleExport}>
            <Download className="h-4 w-4" /> Exportar CSV
          </button>
          <button className={btnPrimary} onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> Novo Contato
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card shadow-sm p-4 flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2.5"><Users className="h-5 w-5 text-primary" /></div>
          <div>
            <p className="text-2xl font-display font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total de Contatos</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card shadow-sm p-4 flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2.5"><MessageSquare className="h-5 w-5" style={{ color: "#3B82F6" }} /></div>
          <div>
            <p className="text-2xl font-display font-bold">{contacts.filter((c) => c.active).length}</p>
            <p className="text-xs text-muted-foreground">Contatos Ativos</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card shadow-sm p-4 flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2.5"><Zap className="h-5 w-5" style={{ color: "#F59E0B" }} /></div>
          <div>
            <p className="text-2xl font-display font-bold">{contacts.filter((c) => parseTags(c.tags).includes("qualificado")).length}</p>
            <p className="text-xs text-muted-foreground">Qualificados</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input className="flex h-9 w-full max-w-sm rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Buscar contato..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm">{search ? `Nenhum resultado para "${search}"` : "Nenhum contato cadastrado"}</p>
          </div>
        ) : (
          <div className="divide-y">
            {contacts.map((c) => {
              const tags = parseTags(c.tags);
              const initials = c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={c.id} className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>{initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{c.name}</p>
                      {tags.map((tag) => (
                        <span key={tag} className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{c.phone}{c.email ? ` · ${c.email}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openWhatsApp(c.phone)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-green-600" title="Abrir WhatsApp">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display font-bold text-lg">Novo Contato</h2>
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
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input className={inputCls} type="email" placeholder="email@exemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Origem</label>
                  <select className={inputCls} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                    <option value="manual">Manual</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="site">Site</option>
                    <option value="indicacao">Indicação</option>
                    <option value="import">Importação</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Tags</label>
                  <input className={inputCls} placeholder="comprador, mcmv..." value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Observações</label>
                <input className={inputCls} placeholder="Notas sobre o contato..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              {feedback && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{feedback}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-xl border text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleCreate} disabled={saving || !form.name || !form.phone}
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
