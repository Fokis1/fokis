import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for admin authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Articles/News table
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  coverImage: text("cover_image"),
  category: text("category").notNull(),
  author: text("author").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  language: text("language").notNull(), // 'ht', 'fr', 'en'
});

// Polls table
export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  options: json("options").$type<string[]>().notNull(),
  results: json("results").$type<Record<string, number>>().default({}),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  language: text("language").notNull(), // 'ht', 'fr', 'en'
});

// Videos table
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  videoUrl: text("video_url").notNull(),
  duration: text("duration").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  language: text("language").notNull(), // 'ht', 'fr', 'en'
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, viewCount: true, commentCount: true });
export const insertPollSchema = createInsertSchema(polls).omit({ id: true, results: true, createdAt: true });
export const insertVideoSchema = createInsertSchema(videos).omit({ id: true });

// Vote schema for polls
export const voteSchema = z.object({
  pollId: z.number(),
  option: z.string(),
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

export type InsertPoll = z.infer<typeof insertPollSchema>;
export type Poll = typeof polls.$inferSelect;

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

export type Vote = z.infer<typeof voteSchema>;
