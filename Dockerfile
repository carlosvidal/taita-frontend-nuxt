# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Argumentos de build para variables de entorno
ARG NUXT_PUBLIC_API_BASE
ARG NUXT_PUBLIC_MAIN_DOMAIN
ARG NUXT_PUBLIC_SITE_NAME="Taita Blog"

# Establecer como variables de entorno para el build
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE
ENV NUXT_PUBLIC_MAIN_DOMAIN=$NUXT_PUBLIC_MAIN_DOMAIN
ENV NUXT_PUBLIC_SITE_NAME=$NUXT_PUBLIC_SITE_NAME

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci && \
    npm cache clean --force

# Copiar el código fuente
COPY . .

# Build de la aplicación Nuxt
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copiar package*.json para instalar solo dependencias de producción
COPY package*.json ./

# Instalar solo dependencias de producción (ignorar scripts)
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copiar archivos compilados desde builder
COPY --from=builder /app/.output ./.output

# Usar usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nuxt -u 1001 && \
    chown -R nuxt:nodejs /app

USER nuxt

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Exponer puerto (usar variable de entorno)
EXPOSE ${PORT}

# Health check - usar variable PORT o fallback a 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "const port = process.env.PORT || 3000; require('http').get('http://localhost:' + port, (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", ".output/server/index.mjs"]
