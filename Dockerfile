FROM node:10-alpine as builder
WORKDIR /usr/src/app/
COPY graphics/assets/ ./graphics/assets/
COPY package.json package-lock.json ./
RUN npm ci
COPY tslint.json tsconfig.json ionic.config.json capacitor.config.json browserslist angular.json ./
COPY src/ ./src/
RUN npm run lint
RUN npm run build:prod

FROM nginx:1.17-alpine

# RUN rm -rf /etc/nginx/conf.d/default.conf
# COPY something /etc/nginx/conf.d/

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /usr/src/app/www/ /usr/share/nginx/html/

EXPOSE 8080
