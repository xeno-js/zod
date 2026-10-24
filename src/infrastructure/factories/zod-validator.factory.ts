import type { Dictionary, IFactory, ILogger, IValidatorService } from '@xeno-js/core'
import type { ZodType } from 'zod'

import { ZodValidatorService } from '../validators'

/**
 * @description Factory class responsible for creating instances of ZodValidatorService based on the provided configuration. It implements the IFactory interface, allowing for easy integration with dependency injection systems. The factory encapsulates the creation logic for the ZodValidatorService, including the initialization of the underlying ZodValidatorService instance with the specified configuration options such as URL and API key. This design promotes separation of concerns and allows for flexibility in managing ZodValidatorService instances across the application.

   * 
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/xeno-js/xeno-js 
   */
export class ZodValidatorFactory implements IFactory<
  { schemas: Dictionary<ZodType>, logger: ILogger },
  IValidatorService
> {
  public create(opts: { schemas: Dictionary<ZodType>, logger: ILogger }): IValidatorService {
    const validatorService = new ZodValidatorService(new Map(), opts.logger)

    for (const [intentKey, schema] of Object.entries(opts.schemas)) {
      validatorService.addSchema(intentKey, schema)
    }

    return validatorService
  }
}
