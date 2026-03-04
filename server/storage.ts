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

export class MemStorage implements IStorage {
  private citiesMap: Map<number, City>;
  private currentId: number;

  constructor() {
    this.citiesMap = new Map();
    this.currentId = 1;
  }

  async getCities(): Promise<City[]> {
    return Array.from(this.citiesMap.values()).sort((a, b) => {
      // Sort desc by createdAt
      return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
    });
  }

  async getCity(id: number): Promise<City | undefined> {
    return this.citiesMap.get(id);
  }

  async createCity(city: InsertCity): Promise<City> {
    const id = this.currentId++;
    const newCity: City = {
      ...city,
      id,
      country: city.country ?? null,
      admin1: city.admin1 ?? null,
      isFavorite: city.isFavorite ?? false,
      createdAt: new Date(),
    };
    this.citiesMap.set(id, newCity);
    return newCity;
  }

  async deleteCity(id: number): Promise<void> {
    this.citiesMap.delete(id);
  }

  async toggleFavoriteCity(id: number, isFavorite: boolean): Promise<City | undefined> {
    const city = this.citiesMap.get(id);
    if (!city) return undefined;
    
    const updated = { ...city, isFavorite };
    this.citiesMap.set(id, updated);
    return updated;
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
