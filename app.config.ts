import { ExpoConfig, ConfigContext } from '@expo/config'
import process from 'process'
const { env } = process

type Environment =
  | 'development'
  | 'production'

interface Extras {
  [key: string]: {
    backendUrl?: string
  }
}

const extras: Extras = {
  development: {
    backendUrl: 'https://dev.api.example.com',
  },
  production: {
    backendUrl: 'https://api.example.com',
  },
}

import { createHash } from 'crypto'
const digest = (apiKey: string): string =>
  createHash('sha256').update(apiKey).digest('base64')

const apiKeyHashesByBackendUrl: Record<string, string> = {
  [extras.development.backendUrl]: 'nHvGh3nPd9hH4Ud9hEJCo+w4jeGmlbE=',
  [extras.production.backendUrl]: 'TaMtH2CTsZ5OUdg3/nrXlqCCGNIWeDA=',
}

type ApiKey = string
const getApiKeyFromEnvironment = (
  environment: Environment
): ApiKey => {
  const apiKeyEnvKey = environment === 'production'
  ? 'PRODUCTION_API_KEY'
  : 'DEVELOPMENT_API_KEY'

  const apiKey = env[apiKeyEnvKey]

  const {backendUrl} = extras[environment]

  const apiKeyHash = apiKeyHashesByBackendUrl[backendUrl]
  if (digest(apiKey) !== apiKeyHash)
    throw new Error(
      `Unknown API_KEY hash, check that it matches the backend`
    )

  return apiKey
}

const getEnvironment = (): Environment => {
  const environment = env.EAS_BUILD_PROFILE as Environment
  if (!environment)
    throw new Error(
      `Missing EAS_BUILD_PROFILE, please set it in your environment`
    )

  return environment
}

const getExtraFromEnvironment = (
  environment: Environment
): typeof extras[string] => {
  const environments = Object.keys(extras)
  if (!environments.includes(environment))
    throw new Error(
      `Invalid environment ${environment}, use one of ${environments}`
    )

  return extras[environment]
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const environment = getEnvironment()

  const extra = getExtraFromEnvironment(environment)

  const apiKey = getApiKeyFromEnvironment(environment)
  if (!apiKey)
    throw new Error(
      `Missing api key, have you set it in your environment?`
    )

  const appConfig = {
    ...config,
    name: config.name,
    slug: config.slug,
    version: config.version,
    platforms: config.platforms,
    icon: `./assets/app-icon.${environment}.png`,
    extra: {
      ...config.extra,
      apiKey,
      backendUrl: extra.backendUrl,
      environment,
      timestamp: Date.now(),
    },
  }

  return appConfig
}
