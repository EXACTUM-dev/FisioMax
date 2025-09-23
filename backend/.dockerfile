# Imagen base ligera de Node
FROM public.ecr.aws/amazonlinux/amazonlinux:2023 AS base

# Instalar Node.js 20 en Amazon Linux 2023
RUN dnf install -y tar gzip shadow-utils \
    && curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - \
    && dnf install -y nodejs \
    && dnf clean all

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
