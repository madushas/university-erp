# Build stage
FROM bellsoft/liberica-openjdk-alpine:17-cds AS build

WORKDIR /app 

# Copy Maven wrapper and pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Make mvnw executable
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM bellsoft/liberica-openjre-alpine:17-cds

WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Add an entrypoint that loads secrets at runtime from files or env vars
# (do not bake secrets into the image via ENV/ARG)
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Create a non-root user, set permissions and fix ownership of runtime files in one layer
RUN addgroup --system spring && adduser --system spring --ingroup spring && \
  mkdir -p /app/logs && \
  chmod +x /usr/local/bin/docker-entrypoint.sh && \
  chown -R spring:spring /usr/local/bin/docker-entrypoint.sh /app/app.jar /app/logs

# Runtime defaults (non-sensitive). Override at runtime via env vars, env-file,
# Docker secrets (swarm) or mounted secret files. Don't put secrets here.
ENV DATABASE_URL=jdbc:postgresql://localhost:5432/university
ENV JWT_EXPIRATION=86400000
ENV JWT_REFRESH_EXPIRATION=604800000
ENV CORS_ALLOWED_ORIGINS=*
ENV SHOW_SQL=false
ENV LOG_LEVEL=info

# Run as non-root
USER spring:spring

EXPOSE 8080

# Health check (curl may not be present in image; it's left as-is but you can
# swap to an HTTP client available in your environment or implement a small
# health-check binary). This runs as the non-root user.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Entrypoint handles loading secrets from runtime sources and then execs the
# Java process.
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
