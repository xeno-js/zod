// ==========================================
// 1. ZOD VALIDATION
// ==========================================
import type { Dictionary, IAppBuilder, IConfigurationService, IPipelineSetup, IXenoApplication, Optional, PipelinePlugin, SetupAction, XenoRegistry } from '@xeno-js/core'
import { SchemaValidationStrategy, TOKENS, withValidation } from '@xeno-js/core'
import { definePlugin } from '@xeno-js/core'
import type { ZodType } from 'zod'

import { ZodValidatorFactory } from './factories/zod-validator.factory'

export const withZodValidation = <TRegistry extends XenoRegistry = XenoRegistry>(
    setup: SetupAction<{ schemas: Dictionary<ZodType> }, IConfigurationService>,
): PipelinePlugin<TRegistry> => {
    return definePlugin('pipeline', (builder: IAppBuilder<TRegistry, IXenoApplication<TRegistry>>, config: IConfigurationService, context: Optional<IPipelineSetup<TRegistry>>) => {
        const opts: { schemas: Dictionary<ZodType> } = { schemas: { } }
        setup(opts, config)
        
        const logger = builder.resolve(TOKENS.LOGGER)
        const validatorService = new ZodValidatorFactory().create({ schemas: opts.schemas, logger })
        builder.addServices((srv) => srv.addSingleton(TOKENS.VALIDATOR_SERVICE, () => validatorService), 3)

        const strategy = new SchemaValidationStrategy(validatorService)
        withValidation<TRegistry>(() => [strategy])(builder, config, context)
    })
}
