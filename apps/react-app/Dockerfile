FROM node:20-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json vite.config.js ./
RUN npm i
COPY index.html ./index.html
COPY src ./src
# >>> API URL pentru Vite
ARG VITE_API_URL_NODE=http://localhost:5002
ENV VITE_API_URL_NODE=$VITE_API_URL_NODE
# <<<
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
