FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build:h5

FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/docker-entrypoint.sh /docker-entrypoint.d/99-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/99-runtime-config.sh

COPY --from=builder /app/dist/build/h5 /usr/share/nginx/html

EXPOSE 80
