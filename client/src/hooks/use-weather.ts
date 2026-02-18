import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertCity, type City, type WeatherData } from "@shared/schema";

// Search Cities (OpenMeteo Geocoding via our backend proxy)
export function useSearchCities(query: string) {
  return useQuery({
    queryKey: [api.weather.search.path, query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const url = buildUrl(api.weather.search.path) + `?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to search cities");
      return await res.json();
    },
    enabled: query.length >= 2,
  });
}

// Get Saved Cities
export function useCities() {
  return useQuery({
    queryKey: [api.cities.list.path],
    queryFn: async () => {
      const res = await fetch(api.cities.list.path);
      if (!res.ok) throw new Error("Failed to fetch cities");
      return api.cities.list.responses[200].parse(await res.json());
    },
  });
}

// Add City
export function useAddCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (city: InsertCity) => {
      const res = await fetch(api.cities.create.path, {
        method: api.cities.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(city),
      });
      if (!res.ok) throw new Error("Failed to add city");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cities.list.path] });
    },
  });
}

// Delete City
export function useDeleteCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.cities.delete.path, { id });
      const res = await fetch(url, { method: api.cities.delete.method });
      if (!res.ok) throw new Error("Failed to delete city");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cities.list.path] });
    },
  });
}

// Get Weather Data
export function useWeather(lat?: string, lon?: string) {
  return useQuery({
    queryKey: [api.weather.get.path, lat, lon],
    queryFn: async () => {
      if (!lat || !lon) throw new Error("Coordinates required");
      const url = `${api.weather.get.path}?lat=${lat}&lon=${lon}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather");
      return api.weather.get.responses[200].parse(await res.json());
    },
    enabled: !!lat && !!lon,
  });
}

// AI Assistant
export function useWeatherAssistant() {
  return useMutation({
    mutationFn: async ({ question, context }: { question: string, context: { city: string, weather: WeatherData } }) => {
      const res = await fetch(api.assistant.chat.path, {
        method: api.assistant.chat.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context }),
      });
      if (!res.ok) throw new Error("Failed to get assistant response");
      return await res.json();
    },
  });
}
