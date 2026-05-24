import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Users ────────────────────────────────────────────────────────────────
  const adminPassword = await hash("nexus2026", 12);
  const agentPassword = await hash("corretor123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nexusimoveis.com.br" },
    update: {},
    create: {
      name: "Gilberto Padilha",
      username: "GILBERTO",
      email: "admin@nexusimoveis.com.br",
      hashedPassword: adminPassword,
      role: "ADMIN",
      phone: "(41) 99999-0000",
      avatar: "GP",
      active: true,
    },
  });

  const agentData = [
    { name: "Carlos Mendes",  username: "CARLOS", email: "carlos@nexusimoveis.com.br", phone: "(41) 99999-0001", creci: "F-45231", avatar: "CM" },
    { name: "Ana Rodrigues",  username: "ANA",    email: "ana@nexusimoveis.com.br",    phone: "(41) 99999-0002", creci: "F-38921", avatar: "AR" },
    { name: "Pedro Lima",     username: "PEDRO",  email: "pedro@nexusimoveis.com.br",  phone: "(41) 99999-0003", creci: "F-52018", avatar: "PL" },
    { name: "Julia Ferreira", username: "JULIA",  email: "julia@nexusimoveis.com.br",  phone: "(41) 99999-0004", creci: "F-61042", avatar: "JF" },
  ];

  const agents: typeof admin[] = [admin];
  for (const a of agentData) {
    const u = await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: { ...a, hashedPassword: agentPassword, role: "AGENT", active: true },
    });
    agents.push(u);
  }

  console.log(`Users: ${agents.length} upserted`);

  // ── Properties ────────────────────────────────────────────────────────────
  const propertyData = [
    { title: "Apto 2Q – Água Verde",       type: "apartamento", region: "Água Verde",      price: 320000, bedrooms: 2, area: 68.5  },
    { title: "Apto 3Q – Batel",            type: "apartamento", region: "Batel",            price: 890000, bedrooms: 3, area: 110.0 },
    { title: "Casa 3Q – Santa Felicidade", type: "casa",        region: "Santa Felicidade", price: 580000, bedrooms: 3, area: 185.0 },
    { title: "Casa 4Q – Ecoville",         type: "casa",        region: "Ecoville",         price: 1200000,bedrooms: 4, area: 280.0 },
    { title: "MCMV – Pinheirinho",         type: "mcmv",        region: "Pinheirinho",      price: 195000, bedrooms: 2, area: 52.0  },
    { title: "MCMV – Fazenda Rio Grande",  type: "mcmv",        region: "Fazenda Rio Grande",price: 185000, bedrooms: 2, area: 48.0  },
    { title: "Terreno – Campo Largo",      type: "terreno",     region: "Campo Largo",      price: 150000, bedrooms: undefined, area: 600.0 },
    { title: "Terreno – Colombo",          type: "terreno",     region: "Colombo",          price: 95000,  bedrooms: undefined, area: 400.0 },
    { title: "Apto 2Q – Cristo Rei",       type: "apartamento", region: "Cristo Rei",       price: 380000, bedrooms: 2, area: 72.0  },
    { title: "Casa 3Q – Boa Vista",        type: "casa",        region: "Boa Vista",        price: 420000, bedrooms: 3, area: 160.0 },
  ];

  const properties = [];
  for (const p of propertyData) {
    const existing = await prisma.property.findFirst({ where: { title: p.title } });
    if (!existing) {
      const prop = await prisma.property.create({ data: { ...p, status: "available" } });
      properties.push(prop);
    } else {
      properties.push(existing);
    }
  }
  console.log(`Properties: ${properties.length} ready`);

  // ── Leads ─────────────────────────────────────────────────────────────────
  const leadData = [
    { name: "Maria Silva",     phone: "(41) 99876-5432", stage: "novo",        value: 320000, agentIdx: 1, propIdx: 0, interest: JSON.stringify({ type: "Apartamento 2Q", region: "Água Verde",      budget: "R$ 280-350K" }), daysInStage: 0 },
    { name: "João Santos",     phone: "(41) 98765-4321", stage: "novo",        value: 580000, agentIdx: 2, propIdx: 2, interest: JSON.stringify({ type: "Casa 3Q",        region: "Santa Felicidade", budget: "R$ 500-650K" }), daysInStage: 1 },
    { name: "Pedro Alves",     phone: "(41) 97111-2233", stage: "novo",        value: 195000, agentIdx: 3, propIdx: 4, interest: JSON.stringify({ type: "MCMV",           region: "Pinheirinho",      budget: "R$ 170-220K" }), daysInStage: 2 },
    { name: "Fernanda Costa",  phone: "(41) 97654-3210", stage: "qualificando",value: 450000, agentIdx: 2, propIdx: 8, interest: JSON.stringify({ type: "Apartamento 3Q", region: "Cabral",           budget: "R$ 400-500K" }), daysInStage: 3 },
    { name: "Roberto Oliveira",phone: "(41) 96543-2109", stage: "qualificando",value: 150000, agentIdx: 1, propIdx: 6, interest: JSON.stringify({ type: "Terreno",        region: "Campo Largo",      budget: "R$ 100-180K" }), daysInStage: 5 },
    { name: "Luciana Pereira", phone: "(41) 95432-1098", stage: "proposta",    value: 890000, agentIdx: 4, propIdx: 1, interest: JSON.stringify({ type: "Apartamento 3Q", region: "Batel",            budget: "R$ 800K-1M" }), daysInStage: 2 },
    { name: "Marco Vieira",    phone: "(41) 94321-0987", stage: "proposta",    value: 1200000,agentIdx: 1, propIdx: 3, interest: JSON.stringify({ type: "Casa 4Q",        region: "Ecoville",         budget: "R$ 1M-1.5M" }), daysInStage: 4 },
    { name: "Camila Rocha",    phone: "(41) 93210-9876", stage: "negociando",  value: 185000, agentIdx: 3, propIdx: 5, interest: JSON.stringify({ type: "MCMV",           region: "Fazenda Rio Grande",budget: "R$ 150-200K" }), daysInStage: 7 },
    { name: "André Lima",      phone: "(41) 92109-8765", stage: "negociando",  value: 380000, agentIdx: 2, propIdx: 8, interest: JSON.stringify({ type: "Apartamento 2Q", region: "Cristo Rei",       budget: "R$ 350-420K" }), daysInStage: 10 },
    { name: "Patricia Santos", phone: "(41) 91098-7654", stage: "fechado",     value: 420000, agentIdx: 1, propIdx: 9, interest: JSON.stringify({ type: "Casa 3Q",        region: "Boa Vista",        budget: "R$ 380-450K" }), daysInStage: 0 },
    { name: "Ricardo Nunes",   phone: "(41) 90987-6543", stage: "perdido",     value: 95000,  agentIdx: 1, propIdx: 7, interest: JSON.stringify({ type: "Terreno",        region: "Colombo",          budget: "R$ 80-110K" }), daysInStage: 0 },
  ];

  for (const l of leadData) {
    const existing = await prisma.lead.findFirst({ where: { phone: l.phone } });
    if (!existing) {
      await prisma.lead.create({
        data: {
          name: l.name,
          phone: l.phone,
          stage: l.stage,
          value: l.value,
          interest: l.interest,
          daysInStage: l.daysInStage,
          agentId: agents[l.agentIdx]?.id,
          propertyId: properties[l.propIdx]?.id,
          source: "whatsapp",
        },
      });
    }
  }
  console.log(`Leads: ${leadData.length} ready`);

  // ── Contacts ──────────────────────────────────────────────────────────────
  const contactData = [
    { name: "Maria Silva",     phone: "(41) 99876-5432", source: "whatsapp", tags: '["comprador"]' },
    { name: "João Santos",     phone: "(41) 98765-4321", source: "whatsapp", tags: '["comprador"]' },
    { name: "Fernanda Costa",  phone: "(41) 97654-3210", source: "site",     tags: '["comprador","mcmv"]' },
    { name: "Roberto Oliveira",phone: "(41) 96543-2109", source: "indicacao",tags: '["comprador"]' },
    { name: "Luciana Pereira", phone: "(41) 95432-1098", source: "whatsapp", tags: '["investidor"]' },
    { name: "Sandro Gonçalves",phone: "(41) 99123-4567", source: "site",     tags: '["locatario"]' },
    { name: "Beatriz Almeida", phone: "(41) 98234-5678", source: "indicacao",tags: '["comprador"]' },
    { name: "Thiago Carvalho", phone: "(41) 97345-6789", source: "whatsapp", tags: '["investidor","comprador"]' },
  ];

  for (const c of contactData) {
    await prisma.contact.upsert({
      where: { phone: c.phone },
      update: {},
      create: { ...c, agentId: agents[1]?.id, active: true },
    });
  }
  console.log(`Contacts: ${contactData.length} ready`);

  // ── Follow-ups ────────────────────────────────────────────────────────────
  const leads = await prisma.lead.findMany({ take: 5 });
  const now = new Date();

  const followUpData = [
    { leadIdx: 0, type: "call",    days: 0,  notes: "Ligar para confirmar interesse no apto Água Verde",     done: false },
    { leadIdx: 1, type: "message", days: 1,  notes: "Enviar fotos da casa Santa Felicidade pelo WhatsApp",    done: false },
    { leadIdx: 2, type: "call",    days: -1, notes: "Follow-up MCMV Pinheirinho",                             done: true  },
    { leadIdx: 3, type: "visit",   days: 2,  notes: "Agendar visita ao apto Cabral",                          done: false },
    { leadIdx: 4, type: "call",    days: 3,  notes: "Retornar proposta do terreno Campo Largo",               done: false },
  ];

  for (const f of followUpData) {
    const lead = leads[f.leadIdx];
    if (!lead) continue;
    const scheduledAt = new Date(now);
    scheduledAt.setDate(scheduledAt.getDate() + f.days);
    const existing = await prisma.followUp.findFirst({ where: { leadId: lead.id, notes: f.notes } });
    if (!existing) {
      await prisma.followUp.create({
        data: {
          leadId: lead.id,
          agentId: lead.agentId,
          scheduledAt,
          done: f.done,
          doneAt: f.done ? new Date() : null,
          notes: f.notes,
          type: f.type,
        },
      });
    }
  }
  console.log(`Follow-ups: ${followUpData.length} ready`);

  // ── Visits ────────────────────────────────────────────────────────────────
  const visitData = [
    { leadIdx: 0, propIdx: 0, days: 1, status: "scheduled", notes: "Visita confirmada pelo WhatsApp" },
    { leadIdx: 3, propIdx: 8, days: 2, status: "scheduled", notes: "Cliente prefere manhã"            },
    { leadIdx: 6, propIdx: 3, days: -1,status: "done",      notes: "Gostou muito — aguardando proposta" },
  ];

  for (const v of visitData) {
    const lead = leads[v.leadIdx];
    const property = properties[v.propIdx];
    if (!lead || !property) continue;
    const scheduledAt = new Date(now);
    scheduledAt.setDate(scheduledAt.getDate() + v.days);
    const existing = await prisma.visit.findFirst({ where: { leadId: lead.id, propertyId: property.id } });
    if (!existing) {
      await prisma.visit.create({
        data: {
          leadId: lead.id,
          propertyId: property.id,
          agentId: lead.agentId,
          scheduledAt,
          status: v.status,
          notes: v.notes,
        },
      });
    }
  }
  console.log(`Visits: ${visitData.length} ready`);

  // ── Broadcasts ────────────────────────────────────────────────────────────
  const broadcastData = [
    {
      name: "Lançamento MCMV Maio",
      message: "Olá! Temos novidades incríveis sobre o programa Minha Casa Minha Vida. Entre em contato conosco e saiba mais!",
      status: "sent",
      totalSent: 150,
      totalFailed: 3,
      sentAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      name: "Promoção Apartamentos Água Verde",
      message: "Apartamentos exclusivos na Água Verde com condições especiais de financiamento. Consulte já!",
      status: "draft",
      totalSent: 0,
      totalFailed: 0,
      sentAt: null,
    },
  ];

  for (const b of broadcastData) {
    const existing = await prisma.broadcast.findFirst({ where: { name: b.name } });
    if (!existing) {
      await prisma.broadcast.create({
        data: { ...b, agentId: admin.id },
      });
    }
  }
  console.log(`Broadcasts: ${broadcastData.length} ready`);

  console.log("\n=== Seed concluído! ===");
  console.log("Login: GILBERTO / nexus2026");
  console.log("Agentes: CARLOS, ANA, PEDRO, JULIA / corretor123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
