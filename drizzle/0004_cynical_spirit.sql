CREATE TABLE "order_grants" (
	"order_id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"phone" text NOT NULL,
	"duration_months" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"lease" text,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_grants" ADD CONSTRAINT "order_grants_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;