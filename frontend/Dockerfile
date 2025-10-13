# Archivo principal de docker para el Frontend.
# Version 1.0.0
# Author EXACTUM-dev

# Etapa 1: Build de Vite
FROM node:20-alpine AS build

WORKDIR /app

# Vars para el build de Vite
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}

# Copiar package.json y lock primero para aprovechar la cache de Docker
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install

# Copiar el resto d código
COPY . .

# Vite genera la carpeta dist
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar el build de Vite al directorio por defecto de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
