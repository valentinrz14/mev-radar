FROM mcr.microsoft.com/playwright:v1.61.1-jammy
WORKDIR /app

# bun se instala vía curl y necesita unzip (la imagen de Playwright no lo trae).
RUN apt-get update \
  && apt-get install -y --no-install-recommends unzip ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun x prisma generate && bun run build

ENV NODE_ENV=production
EXPOSE 3000
# Corre migraciones (si falla, no bloquea el arranque del server) y levanta Next
# bindeando explícitamente al puerto/host que espera Railway.
CMD ["sh", "-c", "bun x prisma migrate deploy || echo 'migrate: omitido (revisar DB)'; bun x next start -H 0.0.0.0 -p ${PORT:-3000}"]
