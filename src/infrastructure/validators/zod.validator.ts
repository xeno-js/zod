import type { ILogger, IValidatorService, ResultType } from '@xeno-js/core'
import { AppError, Guards, Result } from '@xeno-js/core'
import type { core, ZodType } from 'zod'


/**
 * @description Implementation of the IValidatorService interface using Zod schemas for validation. This service maintains a registry of Zod schemas identified by unique keys and provides methods to check for the existence of a schema and to validate data against a specified schema. The validate method returns a ResultType indicating success or failure, with detailed error information in case of validation failure, including formatted error messages from Zod.

 * 
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js 
 */
export class ZodValidatorService implements IValidatorService {
  /**
   * @description Constructs a new instance of the ZodValidatorService class, which takes an ICache instance as a parameter. This cache is used to store and manage the validation schemas that will be applied to incoming data. The constructor initializes the service with the provided cache, allowing it to perform validation checks based on the cached schemas when the validate method is called.
   *
   * @param _cache An instance of ICache used to store and retrieve Zod schemas. This cache is essential for the operation of the validator service, as it allows it to look up and apply the correct schema for validating incoming data.
   * @param _logger An instance of ILogger used to log warning when schema was not found.
   *
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/xeno-js/xeno-js
   */
  constructor(
    private readonly _cache: Map<string, ZodType> = new Map(),
    private readonly _logger: ILogger,
  ) {}

  private static formatIssue(issue: core.$ZodIssue): string {
    const issuePath = !Guards.isNullOrEmpty(issue.path) ? issue.path.map(String).join('.') : 'root'

    return `[${issuePath}] ${issue.message}`
  }

  public addSchema(key: string, schema: ZodType): void {
    this._cache.set(key, schema)
  }

  public async validate<T>(key: string, data: T): Promise<ResultType<boolean>> {
    const schema = this._cache.get(key)
    if (!Guards.isDefined(schema)) {
      this._logger.warn(`Schema for intent: ${key} was not found`)
      return Result.ok()
    }

    const zodResult = schema.safeParse(data)

    if (!zodResult.success) {
      const errorMessage = zodResult.error.issues
        .map((issue) => ZodValidatorService.formatIssue(issue))
        .join(', ')

      return Result.fail(
        AppError.validationError(
          'ZodValidatorService',
          `Validation failed for schema: ${errorMessage}`,
        ),
      )
    }

    return Result.ok(true)
  }
}
