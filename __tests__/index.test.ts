import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'ava'
import { generateEnv } from '../source/generate-env.js'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

test('generateEnv', async (t) => {
  generateEnv({
    envFile: path.resolve(dirname, './.env'),
    templateFile: path.resolve(dirname, '../source/template.ejs'),
    outputFile: path.resolve(dirname, './output-env.ts'),
    clientVarPrefix: 'NEXT_PUBLIC_',
  })

  const expected = await fs.readFile(path.resolve(dirname, './expected-env.ts'), 'utf8')
  const actual = await fs.readFile(path.resolve(dirname, './output-env.ts'), 'utf8')

  t.is(actual, expected)
})
