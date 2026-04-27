-- Event master data tables and transactional event tables.
CREATE TABLE "event_types" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "event_types_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "event_topics" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "event_topics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "event_modes" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "event_modes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "event_levels" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "event_levels_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "event_statuses" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "event_statuses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "registration_statuses" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "registration_statuses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "events" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "startAt" TIMESTAMP(3),
  "endAt" TIMESTAMP(3),
  "timezone" TEXT DEFAULT 'Asia/Jakarta',
  "capacity" INTEGER,
  "registrationOpenAt" TIMESTAMP(3),
  "registrationCloseAt" TIMESTAMP(3),
  "organizerId" TEXT NOT NULL,
  "typeId" TEXT NOT NULL,
  "modeId" TEXT NOT NULL,
  "levelId" TEXT,
  "statusId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "event_topic_map" (
  "eventId" TEXT NOT NULL,
  "topicId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "event_topic_map_pkey" PRIMARY KEY ("eventId", "topicId")
);

CREATE TABLE "event_registrations" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "statusId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "event_types_slug_key" ON "event_types"("slug");
CREATE UNIQUE INDEX "event_topics_slug_key" ON "event_topics"("slug");
CREATE UNIQUE INDEX "event_modes_slug_key" ON "event_modes"("slug");
CREATE UNIQUE INDEX "event_levels_slug_key" ON "event_levels"("slug");
CREATE UNIQUE INDEX "event_statuses_code_key" ON "event_statuses"("code");
CREATE UNIQUE INDEX "registration_statuses_code_key" ON "registration_statuses"("code");
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");
CREATE UNIQUE INDEX "event_registrations_eventId_userId_key" ON "event_registrations"("eventId", "userId");

CREATE INDEX "event_types_isActive_sortOrder_idx" ON "event_types"("isActive", "sortOrder");
CREATE INDEX "event_topics_isActive_sortOrder_idx" ON "event_topics"("isActive", "sortOrder");
CREATE INDEX "event_modes_isActive_sortOrder_idx" ON "event_modes"("isActive", "sortOrder");
CREATE INDEX "event_levels_isActive_sortOrder_idx" ON "event_levels"("isActive", "sortOrder");
CREATE INDEX "event_statuses_isActive_sortOrder_idx" ON "event_statuses"("isActive", "sortOrder");
CREATE INDEX "registration_statuses_isActive_sortOrder_idx" ON "registration_statuses"("isActive", "sortOrder");
CREATE INDEX "events_organizerId_idx" ON "events"("organizerId");
CREATE INDEX "events_typeId_idx" ON "events"("typeId");
CREATE INDEX "events_modeId_idx" ON "events"("modeId");
CREATE INDEX "events_levelId_idx" ON "events"("levelId");
CREATE INDEX "events_statusId_idx" ON "events"("statusId");
CREATE INDEX "events_startAt_idx" ON "events"("startAt");
CREATE INDEX "event_topic_map_topicId_idx" ON "event_topic_map"("topicId");
CREATE INDEX "event_registrations_userId_idx" ON "event_registrations"("userId");
CREATE INDEX "event_registrations_statusId_idx" ON "event_registrations"("statusId");

ALTER TABLE "events"
  ADD CONSTRAINT "events_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "events"
  ADD CONSTRAINT "events_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "event_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "events"
  ADD CONSTRAINT "events_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "event_modes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "events"
  ADD CONSTRAINT "events_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "event_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "events"
  ADD CONSTRAINT "events_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "event_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "event_topic_map"
  ADD CONSTRAINT "event_topic_map_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_topic_map"
  ADD CONSTRAINT "event_topic_map_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "event_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "event_registrations"
  ADD CONSTRAINT "event_registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_registrations"
  ADD CONSTRAINT "event_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_registrations"
  ADD CONSTRAINT "event_registrations_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "registration_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
