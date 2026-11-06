import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  tokenHash: text("token_hash").notNull().unique(),
  nickname: text("nickname").notNull(),
  star: text("star").notNull(),
  createdAt: integer("created_at").notNull(),
  lastPostAt: integer("last_post_at").notNull().default(0),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  authorId: text("author_id").notNull().references(() => profiles.id),
  body: text("body").notNull(),
  parentId: text("parent_id"),
  createdAt: integer("created_at").notNull(),
  deleted: integer("deleted", { mode: "boolean" }).notNull().default(false),
}, table => [
  index("comments_created_idx").on(table.createdAt, table.id),
  index("comments_author_created_idx").on(table.authorId, table.createdAt),
  index("comments_parent_idx").on(table.parentId),
]);

export const reactions = sqliteTable("reactions", {
  commentId: text("comment_id").notNull().references(() => comments.id),
  visitorId: text("visitor_id").notNull().references(() => profiles.id),
  createdAt: integer("created_at").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
}, table => [primaryKey({ columns: [table.commentId, table.visitorId] })]);

export const sessionLimits = sqliteTable("session_limits", {
  ipHash: text("ip_hash").notNull(),
  hour: integer("hour").notNull(),
  count: integer("count").notNull(),
}, table => [primaryKey({ columns: [table.ipHash, table.hour] })]);

export const ownerBindings = sqliteTable("owner_bindings", {
  profileId: text("profile_id").primaryKey().references(() => profiles.id),
  createdAt: integer("created_at").notNull(),
  verifiedAt: integer("verified_at").notNull(),
});
export const ownerLoginCodes = sqliteTable("owner_login_codes", {
  id: text("id").primaryKey(),
  profileId: text("profile_id").notNull().references(() => profiles.id),
  codeHash: text("code_hash").notNull(),
  createdAt: integer("created_at").notNull(),
  expiresAt: integer("expires_at").notNull(),
  ready: integer("ready", { mode: "boolean" }).notNull().default(false),
  attempts: integer("attempts").notNull().default(0),
  consumedAt: integer("consumed_at"),
}, table => [index("owner_codes_profile_expiry_idx").on(table.profileId, table.expiresAt)]);
export const ownerLoginGrants = sqliteTable("owner_login_grants", {
  tokenHash: text("token_hash").primaryKey(),
  profileId: text("profile_id").notNull().references(() => profiles.id),
  createdAt: integer("created_at").notNull(),
  expiresAt: integer("expires_at").notNull(),
}, table => [index("owner_grants_profile_expiry_idx").on(table.profileId, table.expiresAt)]);
export const ownerLoginLimits = sqliteTable("owner_login_limits", {
  scope: text("scope").notNull(),
  windowStart: integer("window_start").notNull(),
  count: integer("count").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, table => [primaryKey({ columns: [table.scope, table.windowStart] })]);
