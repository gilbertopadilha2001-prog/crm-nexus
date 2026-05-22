"use client";

import { useState } from "react";
import { Search, Send, Phone, Paperclip, Smile, Check, CheckCheck, Home, MapPin, DollarSign, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  time: string;
  sent: boolean;
  read: boolean;
}

interface Conversation {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  agent: string;
  interest: { type: string; region: string; budget: string };
  messages: Message[];
}

const conversations: Conversation[] = [
  {
    id: "1", name: "Maria Silva", phone: "(41) 99876-5432",
    lastMessage: "Quero ver o apartamento de 2 quartos na Água Verde",
    time: "5 min", unread: 3, avatar: "MS", agent: "Carlos",
    interest: { type: "Apartamento 2Q", region: "Água Verde", budget: "R$ 280-350K" },
    messages: [
      { id: "m1", text: "Olá! Vi o anúncio do apartamento de 2 quartos na Água Verde", time: "14:20", sent: false, read: true },
      { id: "m2", text: "Olá Maria! Tudo bem? Sim, esse apartamento ainda está disponível!", time: "14:22", sent: true, read: true },
      { id: "m3", text: "Ótimo! Qual o valor?", time: "14:23", sent: false, read: true },
      { id: "m4", text: "O valor é R$ 320.000. Aceita financiamento pelo Minha Casa Minha Vida.", time: "14:25", sent: true, read: true },
      { id: "m5", text: "Que bom! Posso agendar uma visita?", time: "14:30", sent: false, read: true },
      { id: "m6", text: "Quero ver o apartamento de 2 quartos na Água Verde", time: "14:45", sent: false, read: false },
    ],
  },
  {
    id: "2", name: "João Santos", phone: "(41) 98765-4321",
    lastMessage: "Obrigado pelas fotos! Vou analisar", time: "15 min", unread: 0, avatar: "JS", agent: "Ana",
    interest: { type: "Casa 3Q", region: "Santa Felicidade", budget: "R$ 500-650K" },
    messages: [
      { id: "m1", text: "Boa tarde! Procuro uma casa com 3 quartos na região de Santa Felicidade", time: "13:00", sent: false, read: true },
      { id: "m2", text: "Boa tarde João! Temos ótimas opções. Vou enviar algumas fotos.", time: "13:05", sent: true, read: true },
      { id: "m3", text: "Obrigado pelas fotos! Vou analisar", time: "13:30", sent: false, read: true },
    ],
  },
  {
    id: "3", name: "Fernanda Costa", phone: "(41) 97654-3210",
    lastMessage: "Aprovei no financiamento!", time: "32 min", unread: 1, avatar: "FC", agent: "Pedro",
    interest: { type: "MCMV", region: "Pinheirinho", budget: "R$ 170-200K" },
    messages: [
      { id: "m1", text: "Oi! Tenho interesse no programa Minha Casa Minha Vida", time: "11:00", sent: false, read: true },
      { id: "m2", text: "Olá Fernanda! Temos condições especiais. Qual sua faixa de renda?", time: "11:05", sent: true, read: true },
      { id: "m3", text: "Aprovei no financiamento!", time: "12:00", sent: false, read: false },
    ],
  },
  {
    id: "4", name: "Roberto Oliveira", phone: "(41) 96543-2109",
    lastMessage: "Vamos fechar negócio então!", time: "1h", unread: 0, avatar: "RO", agent: "Carlos",
    interest: { type: "Terreno", region: "Campo Largo", budget: "R$ 100-180K" },
    messages: [
      { id: "m1", text: "Procuro terreno na região de Campo Largo", time: "10:00", sent: false, read: true },
      { id: "m2", text: "Vamos fechar negócio então!", time: "11:30", sent: false, read: true },
    ],
  },
  {
    id: "5", name: "Luciana Pereira", phone: "(41) 95432-1098",
    lastMessage: "Qual a metragem exata?", time: "2h", unread: 2, avatar: "LP", agent: "Ana",
    interest: { type: "Apartamento 3Q", region: "Batel", budget: "R$ 800K-1M" },
    messages: [
      { id: "m1", text: "Gostaria de saber mais sobre o apartamento no Batel", time: "09:00", sent: false, read: true },
      { id: "m2", text: "Qual a metragem exata?", time: "09:30", sent: false, read: false },
    ],
  },
];

export default function ConversationsPage() {
  const [selected, setSelected] = useState(conversations[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const filtered = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <div className="animate-fade-in -m-6 flex h-[calc(100vh-56px)]">
      {/* Left — Conversation list */}
      <div className="w-80 xl:w-96 border-r bg-card flex flex-col flex-shrink-0">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar conversa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv)}
              className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors border-b border-border/50 ${
                selected.id === conv.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}
                >
                  {conv.avatar}
                </div>
                {conv.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success text-[10px] font-bold text-white flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${conv.unread > 0 ? "font-bold" : "font-medium"}`}>{conv.name}</p>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">{conv.time}</span>
                </div>
                <p className={`text-xs truncate ${conv.unread > 0 ? "text-foreground" : "text-muted-foreground"}`}>{conv.lastMessage}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--nexus-gold)" }}>{conv.agent}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right — Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="h-14 border-b bg-card px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
              {selected.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold">{selected.name}</p>
              <p className="text-[11px] text-muted-foreground">{selected.phone} — {selected.agent}</p>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Phone className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Messages + Interest panel */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: "#F0F2F5" }}>
            {selected.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                  msg.sent ? "bg-[#DCF8C6] text-foreground rounded-br-md" : "bg-white text-foreground rounded-bl-md"
                }`}>
                  <p>{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${msg.sent ? "justify-end" : ""}`}>
                    <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    {msg.sent && (msg.read ? <CheckCheck className="h-3 w-3 text-blue-500" /> : <Check className="h-3 w-3 text-muted-foreground" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interest panel */}
          <div className="w-60 border-l bg-card p-4 space-y-4 hidden xl:block overflow-y-auto">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interesse do Cliente</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" style={{ color: "var(--nexus-gold)" }} />
                <div>
                  <p className="text-[11px] text-muted-foreground">Tipo</p>
                  <p className="text-sm font-medium">{selected.interest.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" style={{ color: "var(--nexus-gold)" }} />
                <div>
                  <p className="text-[11px] text-muted-foreground">Região</p>
                  <p className="text-sm font-medium">{selected.interest.region}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" style={{ color: "var(--nexus-gold)" }} />
                <div>
                  <p className="text-[11px] text-muted-foreground">Orçamento</p>
                  <p className="text-sm font-medium">{selected.interest.budget}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" style={{ color: "var(--nexus-gold)" }} />
                <div>
                  <p className="text-[11px] text-muted-foreground">Corretor</p>
                  <p className="text-sm font-medium">{selected.agent}</p>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t">
              <button className="w-full h-8 rounded-lg text-xs font-semibold transition-colors"
                style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
                Ver no Kanban
              </button>
            </div>
          </div>
        </div>

        {/* Message input */}
        <div className="border-t bg-card p-3 flex items-center gap-2 flex-shrink-0">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><Smile className="h-5 w-5" /></button>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><Paperclip className="h-5 w-5" /></button>
          <input type="text" placeholder="Digite uma mensagem..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 h-10 px-4 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <button className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
