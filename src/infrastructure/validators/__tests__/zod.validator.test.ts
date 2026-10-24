import type { ILogger, IValidatorService } from '@xeno-js/core'
import { ERROR_CODE_MESSAGES, ERROR_CODES, STATUS_CODES } from '@xeno-js/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { ZodValidatorService } from '../zod.validator'


describe('ZodValidatorService', () => {
  let mockLogger: ILogger
  let sut: IValidatorService

  const fnLogger = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    mockLogger = {
      info: fnLogger,
      warn: fnLogger,
      debug: fnLogger,
      error: fnLogger
    }

    sut = new ZodValidatorService(new Map(), mockLogger)
  })

  describe('addSchema', () => {
    it('adds a schema to the registry and allows subsequent validation', async () => {
      const service = sut
      service.addSchema('user', z.object({ name: z.string() }))

      const result = await service.validate('user', { name: 'Alice' })

      expect(result.isOk()).toBe(true)
    })
  })

  describe('validate', () => {
    it('returns Result.ok(true) when data is valid for schema', async () => {
      const schema = z.object({ name: z.string().min(3) })
      const service = sut
      service.addSchema('user', schema)

      const result = await service.validate('user', { name: 'Alice' })

      expect(result.isOk()).toBe(true)
      expect(result.getValueOrThrow()).toBe(true)
    })

    it('returns Result.ok(true) when schema key is missing', async () => {
      const service = sut
      const result = await service.validate('missing', { any: 'value' })

      expect(result.isOk()).toBe(true)
    })

    it('returns.VALIDATION_FAILED and formats both path and root issues', async () => {
      const schema = z
        .object({
          name: z.string().min(3),
        })
        .superRefine((_value, ctx) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [],
            message: 'root issue',
          })
        })

      const service = sut
      service.addSchema('user', schema)
      const result = await service.validate('user', { name: 'a' })

      expect(result.isOk()).toBe(false)

      const error = result.getErrorOrThrow()
      expect(error.code).toBe(ERROR_CODES.VALIDATION_FAILED)
      expect(error.message).toBe(ERROR_CODE_MESSAGES[ERROR_CODES.VALIDATION_FAILED])
      expect(error.status).toBe(STATUS_CODES.BAD_REQUEST)
      expect(error.name).toBe('ZodValidatorService')
      expect(error.cause).toBeInstanceOf(Error)

      if (error.cause instanceof Error) {
        expect(error.cause.message).toContain('Validation failed for schema:')
        expect(error.cause.message).toContain('[name]')
        expect(error.cause.message).toContain('[root] root issue')
        expect(error.cause.message).toContain(', ')
      }
    })
  })
})
