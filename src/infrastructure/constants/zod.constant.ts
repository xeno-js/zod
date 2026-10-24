import { z } from 'zod'

/**
 * BaseRequestSchema defines the structure of a base request object.
 * It includes the intent of the request and the type of request (either COMMAND or QUERY).
 */
export const BaseRequestSchema = z.object({
  intent: z.string(),
  type: z.enum(['COMMAND', 'QUERY']),
})

/**
 * CacheOptionsSchema defines the structure of cache options for a request.
 * It includes the cache key, time-to-live (ttl), bypass cache flag, consistent read flag, and user-scoped flag.
 */
export const CacheOptionsSchema = z
  .object({
    cacheKey: z.string(),
    ttl: z.number().optional(),
    bypassCache: z.boolean().optional(),
    consistentRead: z.boolean().optional(),
    isUserScoped: z.boolean(),
  })
  .optional()
