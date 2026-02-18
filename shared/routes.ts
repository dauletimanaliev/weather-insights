
import { z } from 'zod';
import { insertCitySchema, cities, weatherSchema, assistantRequestSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  cities: {
    list: {
      method: 'GET' as const,
      path: '/api/cities' as const,
      responses: {
        200: z.array(z.custom<typeof cities.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/cities' as const,
      input: insertCitySchema,
      responses: {
        201: z.custom<typeof cities.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/cities/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    toggleFavorite: {
        method: 'PATCH' as const,
        path: '/api/cities/:id/favorite' as const,
        input: z.object({ isFavorite: z.boolean() }),
        responses: {
            200: z.custom<typeof cities.$inferSelect>(),
            404: errorSchemas.notFound,
        }
    }
  },
  weather: {
    get: {
      method: 'GET' as const,
      path: '/api/weather' as const, // ?lat=...&lon=...
      input: z.object({
        lat: z.string(),
        lon: z.string(),
      }),
      responses: {
        200: weatherSchema,
        400: errorSchemas.validation,
      },
    },
    search: {
        method: 'GET' as const,
        path: '/api/weather/search' as const, // ?q=...
        input: z.object({
            q: z.string(),
        }),
        responses: {
            200: z.array(z.object({
                id: z.number().optional(), // OpenMeteo ID
                name: z.string(),
                latitude: z.number(),
                longitude: z.number(),
                country: z.string().optional(),
                admin1: z.string().optional(),
            })),
            400: errorSchemas.validation
        }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
