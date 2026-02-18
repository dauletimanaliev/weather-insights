
import { db } from "./db";
import { cities, type City, type InsertCity } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getCities(): Promise<City[]>;
  getCity(id: number): Promise<City | undefined>;
  createCity(city: InsertCity): Promise<City>;
  deleteCity(id: number): Promise<void>;
  toggleFavoriteCity(id: number, isFavorite: boolean): Promise<City | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getCities(): Promise<City[]> {
    return await db.select().from(cities).orderBy(desc(cities.createdAt));
  }

  async getCity(id: number): Promise<City | undefined> {
    const [city] = await db.select().from(cities).where(eq(cities.id, id));
    return city;
  }

  async createCity(city: InsertCity): Promise<City> {
    const [newCity] = await db.insert(cities).values(city).returning();
    return newCity;
  }

  async deleteCity(id: number): Promise<void> {
    await db.delete(cities).where(eq(cities.id, id));
  }

  async toggleFavoriteCity(id: number, isFavorite: boolean): Promise<City | undefined> {
      const [updated] = await db.update(cities)
          .set({ isFavorite })
          .where(eq(cities.id, id))
          .returning();
      return updated;
  }
}

export const storage = new DatabaseStorage();
