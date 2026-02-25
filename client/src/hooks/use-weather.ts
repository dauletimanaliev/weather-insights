import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertCity, type City, type WeatherData } from "@shared/schema";

export const STANDALONE = true;

// Helper for direct OpenMeteo Geocoding
async function directSearchCities(query: string) {
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=ru&format=json`);
  if (!response.ok) throw new Error("Geocoding API Error");
  const data = await response.json();
  return data.results || [];
}

// Helper for direct OpenMeteo Weather
async function directFetchWeather(lat: string, lon: string) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
    hourly: "temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant",
    timezone: "auto"
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) throw new Error(`Open-Meteo API Error: ${response.statusText}`);
  const data = await response.json();

  return {
    current: {
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      windSpeed: data.current.wind_speed_10m,
      humidity: data.current.relative_humidity_2m,
      pressure: data.current.surface_pressure,
      uvIndex: data.hourly.uv_index[0] || 0,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day
    },
    hourly: data.hourly.time.map((t: string, i: number) => ({
      time: t,
      temperature: data.hourly.temperature_2m[i],
      precipitationProbability: data.hourly.precipitation_probability[i],
      windSpeed: data.hourly.wind_speed_10m[i],
      weatherCode: data.hourly.weather_code[i]
    })).slice(0, 24),
    daily: data.daily.time.map((t: string, i: number) => ({
      date: t,
      weatherCode: data.daily.weather_code[i],
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
      precipitationSum: data.daily.precipitation_sum[i]
    })).slice(0, 7)
  };
}

// LocalStorage Helpers
const STORAGE_KEY = "weather_app_cities";

function getLocalCities(): City[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}
function saveLocalCities(cities: City[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
}

// Local Heuristic AI Assistant for Standalone Mode
async function localAIChat(question: string, context: { city: string; weather: WeatherData }) {
  const q = question.toLowerCase();
  const current = context.weather.current;
  const temp = current.temperature;
  const weatherCode = current.weatherCode;
  
  // Rain codes: 51, 53, 55, 61, 63, 65, 80, 81, 82
  const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode);
  // Snow codes: 71, 73, 75, 77, 85, 86
  const isSnowing = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const windSpeed = current.windSpeed;

  let answer = "";

  // Simple heuristic responses in Kazakh
  if (q.includes("киім") || q.includes("кию") || q.includes("clothes") || q.includes("одеться")) {
    if (temp < 0) {
      answer = `Қазір ${context.city} қаласында аяз (${temp}°C). Қалың куртка, жылы бөрік және қолғап киюді ұсынамын.`;
    } else if (temp < 10) {
      answer = `Күн салқын (${temp}°C). Жылы күрте немесе пальто кигеніңіз дұрыс.`;
    } else if (temp < 20) {
      answer = `Ауа райы қолайлы (${temp}°C). Жемпір немесе жеңіл куртка жеткілікті.`;
    } else {
      answer = `Күн жылы (${temp}°C). Жеңіл киіммен (футболка, жейде) шыға берсеңіз болады.`;
    }
    if (isRaining) answer += " Жаңбыр жауып тұр, қолшатыр алуды ұмытпаңыз!";
  } 
  else if (q.includes("серуен") || q.includes("гулять") || q.includes("walking") || q.includes("дала")) {
    if (isRaining) {
      answer = `Қазір ${context.city} қаласында жаңбыр жауып тұр. Серуенге шығуды кейінге қалдырған дұрыс немесе қолшатыр алыңыз.`;
    } else if (isSnowing) {
      answer = `Қазір қар жауып тұр. Дала өте әдемі, бірақ жылы киініп шығыңыз!`;
    } else if (temp < -10) {
      answer = `Күн тым суық (${temp}°C). Ұзақ серуендеуді ұсынбаймын, тоңып қалуыңыз мүмкін.`;
    } else if (windSpeed > 30) {
      answer = `Жел өте күшті (${windSpeed} км/сағ). Далаға шыққанда абай болыңыз.`;
    } else {
      answer = `Ауа райы серуендеуге тамаша! Қазір ${temp}°C, жауын-шашын жоқ, аспан ашық.`;
    }
  }
  else if (q.includes("ертең") || q.includes("tomorrow") || q.includes("завтра")) {
    const tomorrow = context.weather.daily[1];
    if (tomorrow) {
      answer = `Ертең ${context.city} қаласында максималды температура ${tomorrow.tempMax}°C, минималды ${tomorrow.tempMin}°C болады деп күтілуде.`;
    } else {
      answer = `Өкінішке орай, ертеңгі күнге болжам әлі дайын емес.`;
    }
  }
  else if (q.includes("сәлем") || q.includes("привет") || q.includes("hello") || q.includes("қалай")) {
    answer = `Сәлем! Мен сіздің жергілікті ауа райы көмекшіңізбін. ${context.city} қаласындағы ауа райы туралы не білгіңіз келеді? Мысалы, не кию керектігін немесе серуенге шығуға болатынын сұраңыз.`;
  }
  else {
    answer = `Қазір ${context.city} қаласында температура ${temp}°C, жел жылдамдығы ${windSpeed} км/сағ. ${isRaining ? "Жаңбыр жауып тұр." : isSnowing ? "Қар жауып тұр." : "Аспан ашық."} Тағы не білгіңіз келеді?`;
  }

  // Simulate small delay
  await new Promise(resolve => setTimeout(resolve, 600));
  return { answer };
}

// Weather Theme Mapping
export function getWeatherThemeClass(code: number): string {
  // Sunny / Clear
  if ([0, 1].includes(code)) return "weather-sunny";
  // Partly Cloudy / Cloudy
  if ([2, 3].includes(code)) return "weather-cloudy";
  // Fog / Mist
  if ([45, 48].includes(code)) return "weather-cloudy";
  // Rain / Drizzle
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "weather-rainy";
  // Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "weather-snowy";
  // Storm
  if ([95, 96, 99].includes(code)) return "weather-stormy";
  
  return "weather-sunny";
}

// Search Cities (OpenMeteo Geocoding via our backend proxy)
export function useSearchCities(query: string) {
  return useQuery({
    queryKey: [api.weather.search.path, query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      if (STANDALONE) {
        return directSearchCities(query);
      }
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
      if (STANDALONE) {
        return getLocalCities();
      }
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
      if (STANDALONE) {
        const cities = getLocalCities();
        const newCity: City = {
          ...city,
          id: Math.floor(Math.random() * 1000000),
          isFavorite: false,
          createdAt: new Date(),
          country: city.country || null,
          admin1: city.admin1 || null
        };
        saveLocalCities([...cities, newCity]);
        return newCity;
      }
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
      if (STANDALONE) {
        const cities = getLocalCities();
        saveLocalCities(cities.filter(c => c.id !== id));
        return;
      }
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
      if (STANDALONE) {
        return directFetchWeather(lat, lon);
      }
      const url = `${api.weather.get.path}?lat=${lat}&lon=${lon}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather");
      return api.weather.get.responses[200].parse(await res.json());
    },
    enabled: !!lat && !!lon,
  });
}

// Air Quality (Standalone / Client-side)
export function useAirQuality(lat: string, lon: string) {
  return useQuery({
    queryKey: ["air-quality", lat, lon],
    queryFn: async () => {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch air quality");
      const data = await res.json();
      return data.current;
    },
    enabled: !!lat && !!lon,
  });
}

// AI Assistant
export function useWeatherAssistant() {
  return useMutation({
    mutationFn: async ({ question, context }: { question: string; context: { city: string; weather: WeatherData } }) => {
      if (STANDALONE) {
        return localAIChat(question, context);
      }
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
