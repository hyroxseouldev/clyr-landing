CREATE TABLE "admin_order_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"recipient" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"provider_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_order_messages_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "order_alert_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"recipient" text NOT NULL,
	"body" text NOT NULL,
	"revision" text NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_order_messages" ADD CONSTRAINT "admin_order_messages_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_alert_settings" ADD CONSTRAINT "order_alert_settings_updated_by_auth_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
INSERT INTO "order_alert_settings" ("id","enabled","recipient","body","revision") VALUES ('new-order',true,'01097224668',$alert$[AMOR LAB 새 주문]
{{이름}}님이 {{프로그램}} {{기간}}개월을 주문했습니다.
입금 예정 금액: {{금액}}원
입금 내역을 확인하고 마스터에서 입금 확인을 처리해 주세요.
주문번호: {{주문번호}}
https://www.amorlab.kr/admin$alert$,'initial');
