FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Build時はCIと同様のダミー値のみ。実際のAuth0情報は起動時に注入する。
RUN AUTH0_SECRET=0123456789abcdef0123456789abcdef \
    AUTH0_DOMAIN=example.auth0.com \
    AUTH0_CLIENT_ID=ci-placeholder \
    AUTH0_CLIENT_SECRET=ci-placeholder \
    AUTH0_BASE_URL=http://localhost:3000 \
    APP_BASE_URL=http://localhost:3000 \
    npm run build:next && rm -rf .next/cache

FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/next.config.mjs ./next.config.mjs
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
# public/__dev-assets の既存symlinkの参照先を保持する。
COPY --from=build --chown=node:node /app/storybook-assets ./storybook-assets
USER node
EXPOSE 3000
# Next.js processの生存だけでなく公開Login画面のHTTP応答を確認する。
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=6 \
  CMD node -e "fetch('http://127.0.0.1:3000/login',{redirect:'manual'}).then(r=>process.exit(r.status>=200&&r.status<400?0:1)).catch(()=>process.exit(1))"
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
