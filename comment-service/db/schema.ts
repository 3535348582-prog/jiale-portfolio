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
