-- REQUIRES: ../schema.sql

CREATE TABLE "pyro_yt_member_handler"."youtube_membership" (
  "channel_id" varchar(255) COLLATE "pg_catalog"."C" NOT NULL,
  "total_duration" int4 NOT NULL,
  "current_streak" int4 NOT NULL,
  "channel_title" text,
  CONSTRAINT "youtube_membership_pkey" PRIMARY KEY ("channel_id") WITH (FILLFACTOR = 80)
)
WITH (FILLFACTOR = 80)
;
