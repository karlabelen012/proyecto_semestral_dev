# =========================
# ETAPA 1 - BUILD
# =========================
FROM node:20 AS build

WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar proyecto
COPY . .

# URLs publicas de los backends (Load Balancers de Kubernetes/EKS)
# Se inyectan desde el pipeline de GitHub Actions como build-args
ARG VITE_API_DESPACHO_URL
ARG VITE_API_VENTAS_URL
ENV VITE_API_DESPACHO_URL=${VITE_API_DESPACHO_URL}
ENV VITE_API_VENTAS_URL=${VITE_API_VENTAS_URL}

# Compilar Vite
RUN npm run build

# =========================
# ETAPA 2 - PRODUCCION
# =========================
FROM nginx:alpine

# Copiar build generado
COPY --from=build /app/dist /usr/share/nginx/html

# Puerto nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]