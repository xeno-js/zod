import { REQUEST_TYPE, type RequestType } from '@xeno-js/core'
import { z } from 'zod'

const baseZodSchema = {
  get(
    intent: string,
    type: RequestType,
  ): z.ZodObject<
    {
      intent: z.ZodLiteral<string>
      type: z.ZodLiteral<RequestType>
    },
    z.core.$strip
  > {
    return z.object({
      intent: z.literal(intent),
      type: z.literal(type),
    })
  },
}

const cacheableOptionsZodSchema = {
  get() {
    return z.object({
      cacheKey: z.string().min(1, 'Cache key is required'),
      ttl: z.number().int().positive().optional(),
      bypassCache: z.boolean().optional(),
      consistentRead: z.boolean().optional(),
      isUserScoped: z.boolean(),
    })
  },
}

/**
 * @description Base schema for any Command
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export const baseCommandZodSchema = {
  /**
   * @description Gets the base schema for a command with the given intent.
   * @param intent The intent of the command.
   * @returns The base schema for the command.
   */
  get(intent: string): z.ZodObject<
    {
      intent: z.ZodLiteral<string>
      type: z.ZodLiteral<RequestType>
    },
    z.core.$strip
  > {
    return baseZodSchema.get(intent, REQUEST_TYPE.COMMAND)
  },
}

/**
 * @description Base schema for any Query
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export const baseQueryZodSchema = {
  /**
   * @description Gets the base schema for a query with the given intent and chache key.
   * @param intent The intent of the query.
   * @returns The base schema for the query.
   */
  get(intent: string): z.ZodObject<
    {
      intent: z.ZodLiteral<string>
      type: z.ZodLiteral<RequestType>
      cacheOptions: z.ZodObject<
        {
          cacheKey: z.ZodString
          ttl: z.ZodOptional<z.ZodNumber>
          bypassCache: z.ZodOptional<z.ZodBoolean>
          consistentRead: z.ZodOptional<z.ZodBoolean>
          isUserScoped: z.ZodBoolean
        },
        z.core.$strip
      >
    },
    z.core.$strip
  > {
    const baseSchema = baseZodSchema.get(intent, REQUEST_TYPE.QUERY)
    return baseSchema.extend({
      cacheOptions: cacheableOptionsZodSchema.get(),
    })
  },
}
