FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --production=false

COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --production=true

COPY --from=build /app/dist ./dist
VOLUME [ "/app/uploads" ]

EXPOSE 8080
CMD ["node", "dist/index.js"]