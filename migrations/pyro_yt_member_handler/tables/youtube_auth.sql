-- REQUIRES: ../schema.sql

CREATE TABLE "pyro_yt_member_handler"."youtube_auth" (
  "channel_id" varchar(255) COLLATE "pg_catalog"."C" NOT NULL,
  "refresh_token" text,
  "expiry_date" timestamp,
  "access_token" text,
  "token_type" text,
  "id_token" text,
  "scope" text,
  CONSTRAINT "youtube_auth_pkey" PRIMARY KEY ("channel_id") WITH (FILLFACTOR = 80)
)
WITH (FILLFACTOR = 80)
;
