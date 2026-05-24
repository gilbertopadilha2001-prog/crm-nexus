"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Send, Loader2, MessageSquare } from "lucide-react";

interface ConvSummary {
  id: string;
  phone: string;
  name: string | null;
  unread: number;
  lastMessage: string | null;
  lastAt: string | null;
  agent: { id: string; name: string } | null;
}

interface Message {
  id: string;
  text: string;
  sent: boolean;
  read: boolean;
  createdAt: string;
}

function initials(name: string | null, phone: string) {
  if (name) return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return phone.slice(-4);
}

function fmtTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function ConversationsPage() {
  const [convs, setConvs] = useState<ConvSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConvs = useCallback(async () => {
    const res = await fetch("/api/conversations");
    if (res.ok) setConvs(await res.json());
    setLoadingConvs(false);
  }, []);

  useEffect(() => { fetchConvs(); }, [fetchConvs]);

  const selectConv = useCallback(async (id: string) => {
    setSelectedId(id);
    setLoadingMsgs(true);
    setMessages([]);
    const res = await fetch(`/api/conversations/${id}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
      setConvs((prev) => prev.map((c) => c.id === id ? { ...c, unread: 0 } : c));
    }
    setLoadingMsgs(false);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    const optimistic: Message = { id: `tmp-${Date.now()}`, text, sent: true, read: false, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    const res = await fetch(`/api/conversations/${selectedId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => prev.map((m) => m.id === optimistic.id ? data.message : m));
      setConvs((prev) => prev.map((c) => c.id === selectedId ? { ...c, lastMessage: text, lastAt: new Date().toISOString() } : c));
    }
    setSending(false);
  };

  const selectedConv = convs.find((c) => c.id === selectedId);

  const filtered = convs.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="animate-fade-in -m-6 flex h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <div className="w-80 xl:w-96 border-r bg-card flex flex-col flex-shrink-0">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar conversa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma conversa ainda.<br />
              As mensagens do WhatsApp aparecem aqui.
            </div>
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConv(conv.id)}
                className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors border-b border-border/50 ${
                  selectedId === conv.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}
                  >
                    {initials(conv.name, conv.phone)}
                  </div>
                  {conv.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 text-[10px] font-bold text-white flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${conv.unread > 0 ? "font-bold" : "font-medium"}`}>
                      {conv.name || conv.phone}
                    </p>
                    <span className="text-[11px] text-muted-foreground flex-shrink-0">{fmtTime(conv.lastAt)}</span>
                  </div>
                  <p className={`text-xs truncate ${conv.unread > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    {conv.lastMessage || "Sem mensagens"}
                  </p>
                  {conv.agent && (
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--nexus-gold)" }}>{conv.agent.name}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      {!selectedId ? (
        <div className="flex-1 flex items-center justify-center bg-muted/10">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">Selecione uma conversa</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-14 border-b bg-card px-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
              {selectedConv ? initials(selectedConv.name, selectedConv.phone) : "?"}
            </div>
            <div>
              <p className="text-sm font-semibold">{selectedConv?.name || selectedConv?.phone}</p>
              <p className="text-[11px] text-muted-foreground">
                {selectedConv?.phone}
                {selectedConv?.agent ? ` — ${selectedConv.agent.name}` : ""}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: "#F0F2F5" }}>
            {loadingMsgs ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground mt-8">Nenhuma mensagem ainda</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    msg.sent ? "bg-[#DCF8C6] text-foreground rounded-br-md" : "bg-white text-foreground rounded-bl-md"
                  }`}>
                    <p>{msg.text}</p>
                    <span className="text-[10px] text-muted-foreground block text-right mt-0.5">
                      {new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t bg-card p-3 flex items-center gap-2 flex-shrink-0">
            <input
              type="text"
              placeholder="Digite uma mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              className="flex-1 h-10 px-4 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
              style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
