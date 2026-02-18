
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// Helper to fetch from Open-Meteo
async function fetchWeather(lat: string, lon: string) {
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
        hourly: "temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index",
        daily: "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant",
        timezone: "auto"
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Open-Meteo API Error: ${response.statusText}`);
    }
    const data = await response.json();

    // Map Open-Meteo structure to our schema
    return {
        current: {
            temperature: data.current.temperature_2m,
            feelsLike: data.current.apparent_temperature,
            windSpeed: data.current.wind_speed_10m,
            humidity: data.current.relative_humidity_2m,
            pressure: data.current.surface_pressure,
            uvIndex: 0, // Open-Meteo current doesn't explicitly give UV, usually in hourly/daily. We can take from hourly[now]
            weatherCode: data.current.weather_code,
            isDay: data.current.is_day
        },
        hourly: data.hourly.time.map((t: string, i: number) => ({
            time: t,
            temperature: data.hourly.temperature_2m[i],
            precipitationProbability: data.hourly.precipitation_probability[i],
            windSpeed: data.hourly.wind_speed_10m[i],
            weatherCode: data.hourly.weather_code[i]
        })).slice(0, 24), // First 24 hours
        daily: data.daily.time.map((t: string, i: number) => ({
            date: t,
            weatherCode: data.daily.weather_code[i],
            tempMax: data.daily.temperature_2m_max[i],
            tempMin: data.daily.temperature_2m_min[i],
            precipitationSum: data.daily.precipitation_sum[i]
        })).slice(0, 7)
    };
}

async function searchCities(query: string) {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`);
    if (!response.ok) {
        throw new Error("Geocoding API Error");
    }
    const data = await response.json();
    return data.results || [];
}

import { seedDatabase } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed database on startup
  await seedDatabase();

  // Cities Endpoints
  app.get(api.cities.list.path, async (req, res) => {
    const cities = await storage.getCities();
    res.json(cities);
  });

  app.post(api.cities.create.path, async (req, res) => {
    try {
        const input = api.cities.create.input.parse(req.body);
        const city = await storage.createCity(input);
        res.status(201).json(city);
    } catch (err) {
        if (err instanceof z.ZodError) {
             res.status(400).json({ message: "Validation error", details: err.errors });
             return;
        }
        throw err;
    }
  });

  app.delete(api.cities.delete.path, async (req, res) => {
    await storage.deleteCity(Number(req.params.id));
    res.status(204).send();
  });
  
  app.patch(api.cities.toggleFavorite.path, async (req, res) => {
      const input = api.cities.toggleFavorite.input.parse(req.body);
      const updated = await storage.toggleFavoriteCity(Number(req.params.id), input.isFavorite);
      if (!updated) {
          return res.status(404).json({ message: "City not found" });
      }
      res.json(updated);
  });

  // Weather Proxy Endpoints
  app.get(api.weather.get.path, async (req, res) => {
      try {
          const { lat, lon } = z.object({ lat: z.string(), lon: z.string() }).parse(req.query);
          const weather = await fetchWeather(lat, lon);
          res.json(weather);
      } catch (err) {
          console.error("Weather API Error:", err);
          res.status(500).json({ message: "Failed to fetch weather data" });
      }
  });

  app.get(api.weather.search.path, async (req, res) => {
      try {
          const { q } = z.object({ q: z.string() }).parse(req.query);
          const results = await searchCities(q);
          res.json(results);
      } catch (err) {
           console.error("Search API Error:", err);
           res.status(500).json({ message: "Failed to search cities" });
      }
  });

  return httpServer;
}
