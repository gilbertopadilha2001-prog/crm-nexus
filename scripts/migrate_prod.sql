-- ========================================================
-- CRM NEXUS: Patch existing schema to match Prisma schema
-- ========================================================

-- 1. Fix role column: convert from enum to text
ALTER TABLE users ALTER COLUMN role TYPE TEXT USING role::text;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'AGENT';
DROP TYPE IF EXISTS "Role";

-- 2. Fix username: ensure NOT NULL and TEXT type
ALTER TABLE users ALTER COLUMN username TYPE TEXT;
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- 3. Add missing WhatsApp columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS "whatsappInstanceId" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "whatsappPhone" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "whatsappStatus" TEXT NOT NULL DEFAULT 'disconnected';

-- 4. Create leads table
CREATE TABLE IF NOT EXISTS "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'novo',
    "notes" TEXT,
    "interest" TEXT,
    "value" DOUBLE PRECISION,
    "source" TEXT,
    "daysInStage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentId" TEXT,
    "propertyId" TEXT,
    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- 5. Create contacts table
CREATE TABLE IF NOT EXISTS "contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "source" TEXT,
    "tags" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentId" TEXT,
    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "contacts_phone_key" ON "contacts"("phone");

-- 6. Create properties table
CREATE TABLE IF NOT EXISTS "properties" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "bedrooms" INTEGER,
    "area" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'available',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- 7. Create broadcasts table
CREATE TABLE IF NOT EXISTS "broadcasts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "totalFailed" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentId" TEXT,
    CONSTRAINT "broadcasts_pkey" PRIMARY KEY ("id")
);

-- 8. Create broadcast_recipients table
CREATE TABLE IF NOT EXISTS "broadcast_recipients" (
    "id" TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    CONSTRAINT "broadcast_recipients_pkey" PRIMARY KEY ("id")
);

-- 9. Create follow_ups table
CREATE TABLE IF NOT EXISTS "follow_ups" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "agentId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "notes" TEXT,
    "type" TEXT NOT NULL DEFAULT 'call',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- 10. Create visits table
CREATE TABLE IF NOT EXISTS "visits" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "propertyId" TEXT,
    "agentId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- 11. Create conversations table
CREATE TABLE IF NOT EXISTS "conversations" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "unread" INTEGER NOT NULL DEFAULT 0,
    "lastMessage" TEXT,
    "lastAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentId" TEXT,
    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "conversations_phone_key" ON "conversations"("phone");

-- 12. Create messages table
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "remoteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- 13. Add foreign keys (idempotent via DO blocks)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_agentId_fkey') THEN
    ALTER TABLE "leads" ADD CONSTRAINT "leads_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_propertyId_fkey') THEN
    ALTER TABLE "leads" ADD CONSTRAINT "leads_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_agentId_fkey') THEN
    ALTER TABLE "contacts" ADD CONSTRAINT "contacts_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'broadcasts_agentId_fkey') THEN
    ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'broadcast_recipients_broadcastId_fkey') THEN
    ALTER TABLE "broadcast_recipients" ADD CONSTRAINT "broadcast_recipients_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "broadcasts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'follow_ups_leadId_fkey') THEN
    ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'follow_ups_agentId_fkey') THEN
    ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'visits_leadId_fkey') THEN
    ALTER TABLE "visits" ADD CONSTRAINT "visits_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'visits_propertyId_fkey') THEN
    ALTER TABLE "visits" ADD CONSTRAINT "visits_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'visits_agentId_fkey') THEN
    ALTER TABLE "visits" ADD CONSTRAINT "visits_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_agentId_fkey') THEN
    ALTER TABLE "conversations" ADD CONSTRAINT "conversations_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_conversationId_fkey') THEN
    ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 14. Create _prisma_migrations table and baseline it
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP WITH TIME ZONE,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP WITH TIME ZONE,
    "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY ("id")
);

INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
SELECT
    gen_random_uuid()::varchar,
    '0000000000000000000000000000000000000000000000000000000000000000',
    NOW(),
    '20260524000000_init_postgresql',
    NULL,
    NULL,
    NOW(),
    1
WHERE NOT EXISTS (
    SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20260524000000_init_postgresql'
);

SELECT 'Migration complete! Tables: ' || string_agg(tablename, ', ' ORDER BY tablename) as status
FROM pg_tables WHERE schemaname = 'public';
