// Configuracion centralizada de las URLs de los backends.
// En desarrollo local (npm run dev) usa localhost.
// En produccion, estas variables se inyectan como build-args de Docker
// (VITE_API_DESPACHO_URL / VITE_API_VENTAS_URL) apuntando a los
// Load Balancers publicos generados por Kubernetes (EKS) para cada backend.

export const API_DESPACHO_URL =
  import.meta.env.VITE_API_DESPACHO_URL || "http://localhost:8081";

export const API_VENTAS_URL =
  import.meta.env.VITE_API_VENTAS_URL || "http://localhost:8082";
