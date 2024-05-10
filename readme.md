# env-to-t3

This is a CLI to generate a TypeScript code to use environment variables safely using [T3 env](https://env.t3.gg).

## Why?

Accessing environment variables directly (e.g., `process.env.API_KEY`) in your TypeScript code is not safe. If you forget to add the environment variable, your code might break. That's why a tool like T3 Env can be very helpful. You can use your environment variables in a safe way and fully typed thanks to [Zod](https://zod.dev).

But writing the code is [a bit tedious](https://env.t3.gg/docs/nextjs#create-your-schema). For example, you have 3 environment variables that you want to use in your code. During the development, you need to write the `.env` file like this:

```
DATABASE_URL=postgres://localhost:5432/my-app
OPEN_AI_API_KEY=1234567890
NEXT_PUBLIC_PUBLISHABLE_KEY=1234567890
```

Then write the code like this:

```tsx
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    OPEN_AI_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_PUBLISHABLE_KEY: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  },
})
```

Notice that you need to write `NEXT_PUBLIC_PUBLISHABLE_KEY` four times in total.

By using this script, you don't need to write the code by hands anymore. Just run the script and it will generate the code for you.

## Features

- By default, all environment variables will be considered as string.
- When the environment variable ends with `_URL`, it will be converted to a `z.string().url()` type.
- When the environment variable has `NEXT_PUBLIC_` prefix, it will be considered as a client-side environment variable.
- When the environment variable has `# required` comment, it will be has a `.min(1)` constraint.
- When the environment variable has `# number` comment, it will be has a `.number()` constraint.
- When the environment variable has `# default` comment, it will be has a `.default()` constraint. The value of the default will be the value of the environment variable if it exists, or `0` if it is a number, or an empty string if it is a string.

Example, you have the following `.env` file:

```env
DATABASE_URL=abcd
OPEN_AI_API_KEY=1 # number required
NEXT_PUBLIC_PUBLISHABLE_KEY=abcd
MINIMUM_DAYS=1 # number
MINIMUM_MEMBERS=10 # number default required
```

Running `env-to-t3` script will generate the following `env.ts` file:

```typescript
  server: {
    DATABASE_URL: z.string().optional(),
    OPEN_AI_API_KEY: z.number().min(1),
    MINIMUM_DAYS: z.number().default(1).optional(),
    MINIMUM_MEMBERS: z.number().min(1).default(10),
  },
  client: {
    NEXT_PUBLIC_PUBLISHABLE_KEY: z.string().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  }
});
```

## Install

```bash
npm i -g env-to-t3
```

Or you can also directly execute the command:

```shell
npx env-to-t3 -i .env
```

## CLI

```
  Usage
    $ env-to-t3 [input]

  Options
    --input, -i <type> The path to the environment file.  [Default: .env]
    --output, -o The path to write the output. [Default: env.ts]
    --client-prefix, -cp The prefix for client-side environment variables. [Default: NEXT_PUBLIC_]

  Examples
    $ env-to-t3 --input .env
```

## Notes

- The generated code is compatible with Next.js >= 13.4.4 as mentioned in [the T3 env documentation](https://env.t3.gg/docs/nextjs#create-your-schema).

## Development

Run

```bash
npx tsx source/cli.tsx -i "./__tests__/.env"
```

## License

MIT

## Contact

[Nico Prananta](https://twitter.com/2co_p)
