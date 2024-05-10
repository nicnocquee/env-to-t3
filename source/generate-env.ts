import fs from 'fs'
import ejs from 'ejs'

// Helper type for environment variable information
type EnvVarInfo = {
  name: string
  validationType: 'string' | 'number'
  required: boolean
  defaultValue: string | number | null
}

// Function to read the environment file and categorize variables with advanced validation logic
const parseEnvFile = (filePath: string, clientVarPrefix: string) => {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split(/\r?\n/)
  const serverVars: EnvVarInfo[] = []
  const clientVars: EnvVarInfo[] = []

  lines.forEach((line) => {
    const [variable, comment] = line.split('#')
    if (!variable || !variable.trim()) return
    const [key, value] = variable.split('=')
    if (!key || !key.trim()) return // Ensure key exists and is not just whitespace

    const trimmedKey = key.trim()
    const trimmedValue = value ? value.trim() : null // Handle case where value might be undefined or only whitespace
    const comments = comment ? comment.toLowerCase().split(' ') : []

    const isRequired = comments.includes('required')
    const isNumber = comments.includes('number')
    const hasDefault = comments.includes('default')

    let defaultValue: string | number | null = null
    if (hasDefault) {
      if (isNumber) {
        defaultValue = trimmedValue ? Number(trimmedValue) : 0
      } else {
        defaultValue = trimmedValue || ''
      }
    }

    const varInfo: EnvVarInfo = {
      name: trimmedKey,
      validationType: isNumber ? 'number' : 'string',
      required: isRequired,
      defaultValue: defaultValue,
    }

    if (trimmedKey.startsWith(clientVarPrefix)) {
      clientVars.push(varInfo)
    } else {
      serverVars.push(varInfo)
    }
  })

  return { serverVars, clientVars }
}

export const generateEnv = ({
  envFile,
  templateFile,
  outputFile,
  clientVarPrefix,
}: {
  envFile: string
  templateFile: string
  outputFile: string
  clientVarPrefix: string
}) => {
  // Render the TypeScript file from the EJS template
  const { serverVars, clientVars } = parseEnvFile(envFile, clientVarPrefix)
  const template = fs.readFileSync(templateFile, 'utf-8')

  const rendered = ejs.render(template, { serverVars, clientVars })
  fs.writeFileSync(outputFile, rendered)
}
