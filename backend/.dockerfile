# Imagen base ligera de Node
FROM node:20-alpine

# Crear directorio de la app
WORKDIR /usr/src/app

# Copiar package.json y lock primero para aprovechar la cache de Docker
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --only=production

# Copiar el resto del código
COPY . .

# Exponer el puerto donde corre tu Express
EXPOSE 5000

# Comando de arranque
CMD ["npm", "start"]
