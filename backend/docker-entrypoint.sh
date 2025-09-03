#!/bin/sh
set -eu

# Runtime entrypoint: load secrets from Docker secrets (mounted at /run/secrets)
# or from environment variables. Do not hard-code secrets in the image.

# Helper to read secret from file (if exists) or from env var
read_secret() {
  name="$1"
  file_path="/run/secrets/$name"
  if [ -f "$file_path" ]; then
    cat "$file_path"
  else
    eval "echo \"\${$name:-}\""
  fi
}

# Required secrets
DB_URL=$(read_secret DATABASE_URL)
DB_USER=$(read_secret DATABASE_USERNAME)
DB_PASS=$(read_secret DATABASE_PASSWORD)
JWT_SECRET=$(read_secret JWT_SECRET)

# Validate presence of required secrets. Note the spaces in the test are required.
if [ -z "$DB_USER" ] || [ -z "$DB_PASS" ] || [ -z "$JWT_SECRET" ] || [ -z "$DB_URL" ]; then
  echo "ERROR: Required secrets not provided. Provide DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD and JWT_SECRET via Docker secrets (preferred) or environment variables." >&2
  echo "You can provide secrets at runtime with: docker run --env-file .env --secret source=jwt_secret,target=JWT_SECRET ..." >&2
  exit 1
fi

# Export into env so the Java app can read them via env vars
export DATABASE_URL="$DB_URL"
export DATABASE_USERNAME="$DB_USER"
export DATABASE_PASSWORD="$DB_PASS"
export JWT_SECRET="$JWT_SECRET"

# Allow passing additional java args or override the jar
if [ "$#" -gt 0 ]; then
  exec "$@"
else
  exec java -jar /app/app.jar
fi
