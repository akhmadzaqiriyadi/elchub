const getEnvValue = (key: string, fallback: string) => {
  const value = process.env[key];

  return value && value.trim().length > 0 ? value : fallback;
};

export const frontendEnv = {
  appName: getEnvValue('NEXT_PUBLIC_APP_NAME', 'Elchub'),
  appTitle: getEnvValue('NEXT_PUBLIC_APP_TITLE', 'Elchub Frontend Boilerplate'),
  appDescription: getEnvValue(
    'NEXT_PUBLIC_APP_DESCRIPTION',
    'Starter frontend based on the reference app',
  ),
  appEnv: getEnvValue('NEXT_PUBLIC_APP_ENV', process.env.NODE_ENV ?? 'development'),
  apiBaseUrl: getEnvValue('NEXT_PUBLIC_API_BASE_URL', '/api'),
} as const;