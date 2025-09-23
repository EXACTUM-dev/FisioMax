# Etapa 1: Build de Vite
FROM public.ecr.aws/amazonlinux/amazonlinux:2023 AS build

RUN dnf install -y tar gzip shadow-utils curl \
    && curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - \
    && dnf install -y nodejs \
    && dnf clean all

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Vite genera la carpeta dist
RUN npm run build

# Etapa 2: Servir con Nginx
FROM public.ecr.aws/amazonlinux/amazonlinux:2023

RUN dnf install -y nginx \
    && dnf clean all

# Copiar el build de Vite al directorio por defecto de Nginx
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
