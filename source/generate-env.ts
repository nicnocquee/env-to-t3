import fs from 'fs'
import ejs from 'ejs'

// Helper type for environment variable information
type EnvVarInfo = {
  name: string
  validationType: 'string' | 'number'
  required: boolean
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
    const [key] = variable.split('=').map((part) => part.trim())
    if (!key) return

    // Parsing comments for multiple checks
    const comments = comment ? comment.toLowerCase().split(' ') : []
    const isRequired = comments.includes('required')
    const isNumber = comments.includes('number')

    const varInfo: EnvVarInfo = {
      name: key,
      validationType: isNumber ? 'number' : 'string',
      required: isRequired,
    }

    if (key.startsWith(clientVarPrefix)) {
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
