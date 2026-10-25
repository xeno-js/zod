<div align="center">
  <img src="logo/logo.png" alt="Xeno.JS Logo" width="140" />

  <h1>Xeno.JS Zod</h1>
  <p><strong>A Typescript application framework architecture for Node.js, designed for lower technical debt, and faster infrastructure migrations.</strong></p>
  <p>Build long-lived applications with explicit dependency injection, DDD, CQRS, and transport-independent business logic.</p>

  <p>
    <a href="https://www.npmjs.com/package/@xeno-js/zod"><img src="https://img.shields.io/npm/v/@xeno-js/zod?style=flat-square" alt="NPM Version" /></a>
    <a href="https://github.com/xeno-js/zod"><img src="https://img.shields.io/badge/Powered%20by-Xeno-blueviolet?style=flat-square" alt="Powered by Xeno" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License: MIT" /></a>
    <a href="https://buymeacoffee.com/xenojs">
      <img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-FFdd00?style=flat-square&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
    </a>
  </p>
</div>

---

---

`@xeno-js/zod` integrates [Zod](https://github.com/colinhacks/zod) into the
Xeno.JS ecosystem. It supplies validation services, pipeline plugins, and schema
utilities to ensure incoming payloads adhere strictly to expected domain
contracts.

## Install

```bash
npm install @xeno-js/zod zod

```

Requires `@xeno-js/core` and an active Zod peer dependency.

---

## 1. Pipeline Validation Integration

**Problem.** Incoming application commands and queries must be structurally
validated at runtime before reaching execution handlers to prevent invalid data
propagation.

**Principle.** Validation policies should integrate directly into the request
pipeline as an explicit cross-cutting concern, utilizing registered schemas
mapped by request intents.

**Mechanism.** The `withZodValidation` plugin configures a `ZodValidatorService`
as a singleton in the container under `TOKENS.VALIDATOR_SERVICE`, supplying a
validation strategy to the core pipeline infrastructure.

**Implementation:**

```ts
import { XenoAppBuilder } from '@xeno-js/core'
import { withZodValidation } from '@xeno-js/zod'
import { z } from 'zod'

const app = await new XenoAppBuilder()
  .addPipeline()
  .usePipelinePlugin(
    withZodValidation({
      schemas: {
        CreateUserCommand: z.object({
          intent: z.literal('CreateUserCommand'),
          type: z.literal('COMMAND'),
          email: z.string().email(),
          age: z.number().int().positive(),
        }),
      },
    }),
  )
  .build()
```

**Behavior:** When requests pass through the pipeline, `ZodValidatorService`
looks up the schema matching the request intent. If a schema is found, it
executes `safeParse`. If validation fails, it returns a `Result.fail` containing
a formatted validation error (`ERROR_CODES.VALIDATION_FAILED`). If no schema is
registered for a given intent, it logs a warning and allows the request to pass.

**Boundary:** This package handles payload structure and type validation via Zod
schemas. It does not handle asynchronous business rule validations (such as
database uniqueness checks) which belong inside application handlers or domain
services.

---

## 2. Schema Utilities for Commands and Queries

**Problem.** Manually writing base schema metadata (`intent`, `type`, and query
cache options) for every command and query leads to repetitive boilerplate code.

**Principle.** Base framework contracts for commands and queries must be
enforced consistently across all schema definitions.

**Mechanism:** `ZodUtils` provides helper methods (`createCommandSchema` and
`createQuerySchema`) that extend strict base schemas with custom shape
properties.

**Implementation:**

```ts
import { ZodUtils } from '@xeno-js/zod'
import { z } from 'zod'

// Creates a strict command schema enforcing intent and type constraints
const createUserSchema = ZodUtils.createCommandSchema('CreateUserCommand', {
  name: z.string().min(2),
  email: z.string().email(),
})

// Creates a strict query schema including mandatory cacheOptions support
const getUserQuery = ZodUtils.createQuerySchema('GetUserQuery', {
  userId: z.string().uuid(),
})
```

**Behavior:** `ZodUtils` automatically incorporates base requirements (such as
matching request types and strict property stripping via `.strict()`) ensuring
unrecognized payload fields are rejected.

**Boundary:** `ZodUtils` simplifies schema composition but relies entirely on
underlying Zod validation mechanisms for error formatting and parsing execution.

---

## License

Released under the [MIT License](LICENSE).
