import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull();

export const user = pgTable("auth_user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  phoneNumber: text("phone_number").unique(),
  phoneNumberVerified: boolean("phone_number_verified")
    .default(false)
    .notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  "auth_session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("auth_session_user_idx").on(table.userId)],
);

export const account = pgTable(
  "auth_account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("auth_account_user_idx").on(table.userId)],
);

export const verification = pgTable(
  "auth_verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("auth_verification_identifier_idx").on(table.identifier)],
);

export const rateLimit = pgTable("auth_rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

// Existing order IDs and timestamps are preserved during the legacy import.
export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    buyer_name: text("buyer_name").notNull(),
    buyer_phone: text("buyer_phone").notNull(),
    buyer_phone_normalized: text("buyer_phone_normalized").notNull(),
    status: text("status")
      .$type<"pending" | "confirmed" | "canceled">()
      .default("pending")
      .notNull(),
    order_payload: jsonb("order_payload")
      .$type<import("../orders/policy").OrderRow["order_payload"]>()
      .notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    confirmed_at: timestamp("confirmed_at", { withTimezone: true }),
    canceled_at: timestamp("canceled_at", { withTimezone: true }),
  },
  (table) => [
    index("orders_phone_idx").on(table.buyer_phone_normalized),
    index("orders_status_created_idx").on(table.status, table.created_at),
  ],
);

export const orderEvents = pgTable("order_events", {
  id: text("id").primaryKey(),
  order_id: text("order_id")
    .notNull()
    .references(() => orders.id),
  actor_id: text("actor_id")
    .notNull()
    .references(() => user.id),
  status: text("status").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const messageTemplates = pgTable("message_templates", {
  id: text("id").primaryKey(),
  body: text("body").notNull(),
  updated_by: text("updated_by")
    .notNull()
    .references(() => user.id),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const orderMessages = pgTable("order_messages", {
  id: text("id").primaryKey(),
  order_id: text("order_id")
    .notNull()
    .unique()
    .references(() => orders.id),
  recipient: text("recipient").notNull(),
  body: text("body").notNull(),
  status: text("status")
    .$type<"pending" | "sending" | "accepted" | "failed" | "unknown">()
    .default("pending")
    .notNull(),
  attempts: integer("attempts").default(0).notNull(),
  provider_id: text("provider_id"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const bankSettings = pgTable("bank_settings", {
  id: text("id").primaryKey(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  holderName: text("holder_name").notNull(),
  revision: text("revision").notNull(),
  updatedBy: text("updated_by").references(() => user.id),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const orderGrants = pgTable("order_grants", {
  order_id: text("order_id")
    .primaryKey()
    .references(() => orders.id),
  program_id: text("program_id").notNull(),
  phone: text("phone").notNull(),
  duration_months: integer("duration_months").notNull(),
  status: text("status")
    .$type<"pending" | "sending" | "waiting" | "claimed" | "failed">()
    .notNull()
    .default("pending"),
  attempts: integer("attempts").notNull().default(0),
  lease: text("lease"),
  starts_at: timestamp("starts_at", { withTimezone: true }),
  ends_at: timestamp("ends_at", { withTimezone: true }),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
