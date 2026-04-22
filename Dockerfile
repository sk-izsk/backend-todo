FROM oven/bun:1.3.7-alpine

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate

EXPOSE 3020

CMD ["bun", "run", "src/server.ts"]