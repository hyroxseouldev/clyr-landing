CREATE TABLE "bank_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"holder_name" text NOT NULL,
	"revision" text NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bank_settings" ADD CONSTRAINT "bank_settings_updated_by_auth_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
INSERT INTO "bank_settings" ("id", "bank_name", "account_number", "holder_name", "revision") VALUES ('primary', '국민은행', '824001-04-091290', '전준현', 'initial');
