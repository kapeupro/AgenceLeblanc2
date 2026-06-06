# Agence Leblanc — image unique : Bun sert l'API + les uploads + le SPA buildé.
FROM oven/bun:1 AS build
WORKDIR /app

# Installe les dépendances du monorepo (workspaces shared/backend/frontend)
COPY package.json bun.lock* ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN bun install

# Copie le code et build le frontend (sort dans frontend/dist)
COPY . .
RUN bun run --cwd frontend build

# --- Image finale ---
FROM oven/bun:1
WORKDIR /app
COPY --from=build /app /app

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# Healthcheck : l'app expose GET /health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:'+(process.env.PORT||3001)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "run", "--cwd", "backend", "start"]
