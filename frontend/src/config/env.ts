export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  JWT_EXPIRY_TIME: parseInt(process.env.NEXT_PUBLIC_JWT_EXPIRY_TIME || '900000'),
  REFRESH_TOKEN_EXPIRY: parseInt(process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY || '604800000'),
};