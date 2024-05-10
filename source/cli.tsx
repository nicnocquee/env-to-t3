#!/usr/bin/env node
import meow from 'meow'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateEnv } from './generate-env.js'

const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory

const cli = meow(
  `
  Usage
    $ env-to-t3 [input]

  Options
    --input, -i <type> The path to the environment file.  [Default: .env]
    --output, -o The path to write the output. [Default: env.ts]
    --client-prefix, -cp The prefix for client-side environment variables. [Default: NEXT_PUBLIC_]
    
  Examples
    $ env-to-t3 --input .env
`,
  {
    importMeta: import.meta,
    flags: {
      input: { type: 'string', shortFlag: 'i', default: '.env' },
      output: { type: 'string', shortFlag: 'o', default: 'env.ts' },
      clientPrefix: { type: 'string', shortFlag: 'cp', default: 'NEXT_PUBLIC_' },
    },
  }
)
const envPath = path.resolve(process.cwd(), cli.flags.input)
if (!fs.existsSync(envPath)) {
  console.error(
    `Environment file not found at ${envPath}. Please provide a valid path to the environment file.`
  )
  process.exit(1)
}

generateEnv({
  envFile: envPath,
  templateFile: path.resolve(__dirname, './template.ejs'),
  outputFile: path.resolve(process.cwd(), cli.flags.output),
  clientVarPrefix: cli.flags.clientPrefix,
})
