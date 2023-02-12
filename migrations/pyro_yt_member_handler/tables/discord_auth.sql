-- REQUIRES: ../schema.sql
-- REQUIRES: ../../extensions/uuid-ossp.sql

CREATE TABLE "pyro_yt_member_handler"."discord_auth" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "last_state_update_at" timestamp NOT NULL DEFAULT '1970-01-01 00:00:00',
  "expires_at" timestamp NOT NULL,
  "access_token" varchar(255) COLLATE "pg_catalog"."C" NOT NULL,
  "token_type" varchar(255) COLLATE "pg_catalog"."C" NOT NULL,
  "refresh_token" varchar(255) COLLATE "pg_catalog"."C" NOT NULL,
  "scope" text COLLATE "pg_catalog"."C" NOT NULL,
  "current_state" jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT "discord_auth_access_token_key" UNIQUE ("access_token") WITH (FILLFACTOR = 80),
  CONSTRAINT "discord_auth_pkey" PRIMARY KEY ("id") WITH (FILLFACTOR = 80)
)
WITH (FILLFACTOR = 80)
;
