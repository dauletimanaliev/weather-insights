
import { storage } from "./storage";

export async function seedDatabase() {
  const existingCities = await storage.getCities();
  if (existingCities.length === 0) {
    console.log("Seeding database with default cities...");
    await storage.createCity({
      name: "London",
      lat: "51.5074",
      lon: "-0.1278",
      country: "United Kingdom",
      admin1: "England",
      isFavorite: true
    });
    await storage.createCity({
      name: "New York",
      lat: "40.7128",
      lon: "-74.0060",
      country: "United States",
      admin1: "New York",
      isFavorite: true
    });
    await storage.createCity({
      name: "Tokyo",
      lat: "35.6895",
      lon: "139.6917",
      country: "Japan",
      admin1: "Tokyo",
      isFavorite: false
    });
    await storage.createCity({
      name: "Sydney",
      lat: "-33.8688",
      lon: "151.2093",
      country: "Australia",
      admin1: "New South Wales",
      isFavorite: false
    });
    console.log("Seeding complete.");
  } else {
      console.log("Database already seeded.");
  }
}
