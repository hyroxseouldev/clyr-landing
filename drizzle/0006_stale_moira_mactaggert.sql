CREATE TABLE "order_reversals" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"issuance_id" text,
	"kind" text NOT NULL,
	"reason" text NOT NULL,
	"actor_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"lease" text,
	"manual_access_reviewed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_events" ADD COLUMN "reason" text;--> statement-breakpoint
ALTER TABLE "order_grants" ADD COLUMN "issuance_id" text;
UPDATE "order_grants" SET "issuance_id" = "order_id";--> statement-breakpoint
ALTER TABLE "order_reversals" ADD CONSTRAINT "order_reversals_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_reversals" ADD CONSTRAINT "order_reversals_actor_id_auth_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_reversals_order_idx" ON "order_reversals" USING btree ("order_id");