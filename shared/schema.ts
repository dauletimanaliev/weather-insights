
import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// We'll store searched cities or favorites here
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  lat: text("lat").notNull(),
  lon: text("lon").notNull(),
  country: text("country"),
  admin1: text("admin1"), // State/Region
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertCitySchema = createInsertSchema(cities).omit({ id: true, createdAt: true });

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type City = typeof cities.$inferSelect;
export type InsertCity = z.infer<typeof insertCitySchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Types for the weather API responses (Open-Meteo) to ensure type safety in frontend
export const weatherSchema = z.object({
  current: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    windSpeed: z.number(),
    humidity: z.number(),
    pressure: z.number(),
    uvIndex: z.number(),
    weatherCode: z.number(),
    isDay: z.number(),
  }),
  hourly: z.array(z.object({
    time: z.string(),
    temperature: z.number(),
    precipitationProbability: z.number(),
    windSpeed: z.number(),
    weatherCode: z.number(),
  })),
  daily: z.array(z.object({
    date: z.string(),
    weatherCode: z.number(),
    tempMax: z.number(),
    tempMin: z.number(),
    precipitationSum: z.number(),
  })),
});

export type WeatherData = z.infer<typeof weatherSchema>;

// AI Assistant types
export const assistantRequestSchema = z.object({
  question: z.string(),
  context: z.object({
    city: z.string(),
    weather: weatherSchema,
  }),
});

export type AssistantRequest = z.infer<typeof assistantRequestSchema>;
