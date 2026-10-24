import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { ZodUtils } from '../schema-zod.utils'

describe('ZodUtils', () => {
  describe('createCommandSchema', () => {
    it('extends the command schema with additional properties', () => {
      const schema = ZodUtils.createCommandSchema('TEST_INTENT', {
        userId: z.string().uuid(),
      })

      const result = schema.safeParse({
        intent: 'TEST_INTENT',
        type: 'COMMAND',
        userId: '550e8400-e29b-41d4-a716-446655440000',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.userId).toBe('550e8400-e29b-41d4-a716-446655440000')
      }
    })

    it('keeps the base command constraints', () => {
      const schema = ZodUtils.createCommandSchema('TEST_INTENT', {
        userId: z.string(),
      })

      expect(schema.safeParse({ userId: 'user-1', type: 'COMMAND' }).success).toBe(false)
      expect(
        schema.safeParse({ intent: 'fake_intent', type: 'COMMAND', userId: 'user-1' }).success,
      ).toBe(false)
      expect(
        schema.safeParse({ intent: 'TEST_INTENT', type: 'QUERY', userId: 'user-1' }).success,
      ).toBe(false)
    })
  })

  describe('createQuerySchema', () => {
    it('extends the query schema and preserves cache options', () => {
      const schema = ZodUtils.createQuerySchema('TEST_INTENT', {
        userId: z.string().uuid(),
      })

      const result = schema.safeParse({
        intent: 'TEST_INTENT',
        type: 'QUERY',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        cacheOptions: {
          cacheKey: 'user:1',
          ttl: 60,
          bypassCache: false,
          consistentRead: true,
          isUserScoped: true,
        },
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.cacheOptions).toEqual({
          cacheKey: 'user:1',
          ttl: 60,
          bypassCache: false,
          consistentRead: true,
          isUserScoped: true,
        })
      }
    })

    it('rejects invalid required cache options', () => {
      const schema = ZodUtils.createQuerySchema('TEST_INTENT', {
        userId: z.string(),
      })

      expect(
        schema.safeParse({
          intent: 'TEST_INTENT',
          type: 'COMMAND',
          userId: 'user-1',
          cacheOptions: { cacheKey: '' },
        }).success,
      ).toBe(false)
    })
  })
})
