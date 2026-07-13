FROM mcr.microsoft.com/playwright:v1.49.0-jammy
WORKDIR /app
# instalar bun en la imagen (la base trae Node, no bun)
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bunx prisma generate && bun run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "bunx prisma migrate deploy && bun run start"]
