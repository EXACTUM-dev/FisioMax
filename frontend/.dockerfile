# Etapa 1: Build de React
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Generar el build optimizado de React
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine

# Copiar el build al directorio que Nginx usa por defecto
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Exponer puerto de Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
