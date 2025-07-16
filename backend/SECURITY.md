# Security Guidelines for Backend

## Environment Variables
All sensitive configuration should use environment variables, never hardcoded values.

### Required Environment Variables:
- `DATABASE_URL` - Database connection URL
- `DATABASE_USERNAME` - Database username
- `DATABASE_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret (minimum 64 characters)
- `JWT_EXPIRATION` - JWT token expiration time (optional, default: 24 hours)
- `JWT_REFRESH_EXPIRATION` - JWT refresh token expiration (optional, default: 7 days)
- `CORS_ALLOWED_ORIGINS` - Allowed CORS origins
- `SHOW_SQL` - Show SQL queries in logs (optional, default: false)
- `LOG_LEVEL` - Logging level (optional, default: info)

### Production Deployment:
1. Use cloud provider's secret management services
2. Set environment variables at deployment time
3. Never commit .env files to version control
4. Use strong, randomly generated secrets
5. Rotate secrets regularly

### Local Development:
1. Copy `.env.example` to `.env`
2. Fill in your local configuration values
3. The `.env` file is automatically ignored by Git

## Security Best Practices:
- Use HTTPS in production
- Validate all environment variables on startup
- Use strong JWT secrets (minimum 64 characters)
- Enable CORS only for trusted origins
- Monitor logs for security issues
- Keep dependencies updated
