# Archivo principal de docker para el Backend.
# Version 1.0.0
# Author EXACTUM-dev

# Imagen base ligera de Node
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package.json y lock primero para aprovechar la cache de Docker
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --production

# Copiar el resto del código
COPY . .

# Exponer el puerto donde corre tu Express
EXPOSE 5000

# Comando de arranque
CMD ["npm", "start"]
