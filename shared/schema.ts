
import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const insertCitySchema = createInsertSchema(cities).omit({ id: true, createdAt: true });

export type City = typeof cities.$inferSelect;
export type InsertCity = z.infer<typeof insertCitySchema>;

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
