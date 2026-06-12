# Proyecto Semestral — Orquestación y Automatización en AWS EKS (EP3)

Aplicación **Innovatech Chile** (gestión de Ventas y Despachos) desplegada sobre **Amazon EKS**, con
imágenes publicadas en **Amazon ECR**, autoscaling mediante **HPA**, y pipeline **CI/CD con GitHub Actions**
(build → push → deploy).

## 1. Arquitectura

```
                                Internet
                                   │
        ┌──────────────────────────────────────────────────┐
        │                     AWS VPC (10.0.0.0/16)         │
        │   Subred pública A (us-east-1a) | Subred pública B (us-east-1b)
        │                                                    │
        │   ┌──────────────── EKS Cluster ────────────────┐ │
        │   │  Node Group (2-4 nodos t3.medium, ON_DEMAND) │ │
        │   │                                              │ │
        │   │  ┌───────────┐   ┌───────────────┐  ┌──────┐ │ │
        │   │  │ Frontend  │   │ Backend Ventas│  │MySQL │ │ │
        │   │  │ (2 pods)  │   │ (2 pods + HPA)│  │Ventas│ │ │
        │   │  │  LB (80)  │   │   LB (8082)   │  └──────┘ │ │
        │   │  └───────────┘   └───────────────┘           │ │
        │   │                  ┌────────────────┐ ┌───────┐│ │
        │   │                  │Backend Despacho│ │MySQL  ││ │
        │   │                  │(2 pods + HPA)  │ │Despacho││ │
        │   │                  │   LB (8081)    │ └───────┘│ │
        │   │                  └────────────────┘          │ │
        │   └──────────────────────────────────────────────┘ │
        │                                                    │
        │   ECR: backend-ventas | backend-despacho | frontend│
        └──────────────────────────────────────────────────┘
```

- **Orquestador**: AWS EKS (Kubernetes 1.29).
- **Cómputo**: Node Group con **2 nodos worker `t3.medium`** (mín. 2 / máx. 4) → alta disponibilidad
  (si un nodo falla, los pods se reprograman en el otro) y soporte para autoscaling.
- **Networking**: VPC propia con 2 subredes públicas en distintas AZ (requerido por EKS),
  Internet Gateway, route table y un Security Group abierto para los Load Balancers.
- **Acceso público**:
  - Frontend → `Service` tipo `LoadBalancer` (puerto 80).
  - Backend Ventas → `Service` tipo `LoadBalancer` (puerto 8082).
  - Backend Despacho → `Service` tipo `LoadBalancer` (puerto 8081).
  - MySQL (ambas) → `Service` tipo `ClusterIP` (solo accesibles dentro del clúster).
- **Comunicación Frontend → Backend**: el frontend (SPA en React/Vite) corre en el navegador del
  usuario, por lo que **no puede** usar DNS interno de Kubernetes. Por eso cada backend se expone
  con su propio Load Balancer público, y el pipeline CI/CD compila el frontend inyectando esas
  URLs como variables de entorno de build (`VITE_API_DESPACHO_URL`, `VITE_API_VENTAS_URL`).
- **Roles IAM**: se reutiliza el rol `LabRole` de AWS Academy tanto para el `cluster_role` del
  EKS como para el `node_role` del Node Group (en AWS Academy Learner Lab no se permite crear
  roles IAM nuevos).
- **SSH**: se genera un par de llaves (`tls_private_key` + `aws_key_pair`) y se habilita
  `remote_access` en el Node Group, permitiendo conectarse vía SSH a los nodos EC2 worker para
  depuración (la llave privada se expone como output sensible de Terraform).

## 2. Estructura del repositorio

```
proyecto semestral/
├── back-Ventas_SpringBoot/Springboot-API-REST/        # Backend Ventas (Spring Boot, puerto 8082)
├── back-Despachos_SpringBoot/Springboot-API-REST-DESPACHO/  # Backend Despachos (Spring Boot, puerto 8081)
├── front_despacho/                                    # Frontend React + Vite (Dockerfile multi-stage -> nginx)
├── docker-compose.yml                                 # Levanta el stack completo en local (desarrollo)
├── infra/
│   ├── terraform/
│   │   ├── main.tf        # VPC, subredes, EKS, Node Group, SG, ECR, SSH key
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── k8s/
│       ├── 00-namespace.yaml
│       ├── 01-mysql-ventas.yaml      # Deployment + PVC + Service (ClusterIP)
│       ├── 02-mysql-despacho.yaml    # Deployment + PVC + Service (ClusterIP)
│       ├── 03-backend-ventas.yaml    # Deployment + Service (LB) + HPA
│       ├── 04-backend-despacho.yaml  # Deployment + Service (LB) + HPA
│       └── 05-frontend.yaml          # Deployment + Service (LB) + HPA
└── .github/workflows/
    ├── infra.yml   # Provisiona/destruye EKS + ECR + VPC (Terraform)
    └── ci-cd.yml   # Build -> Push ECR -> Deploy EKS (en cada push a main)
```

## 3. Despliegue paso a paso

### 3.1 Pre-requisitos
1. Cuenta **AWS Academy Learner Lab** activa (rol `LabRole` disponible).
2. Configurar en GitHub → *Settings → Secrets and variables → Actions* los secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN`

   (Estos se copian desde la sección **AWS Details → AWS CLI** del Learner Lab; deben
   actualizarse cada vez que se reinicia el laboratorio, ya que las credenciales son temporales).

### 3.2 Provisionar la infraestructura (Terraform)
1. Ir a la pestaña **Actions** del repositorio.
2. Ejecutar manualmente el workflow **"Infra - Terraform (EKS, ECR, VPC)"** con `action = apply`.
3. Esperar ~10-15 minutos (la creación del clúster EKS y el Node Group toma tiempo).
4. Esto crea: VPC, 2 subredes, IGW, Security Group, clúster EKS, Node Group (2 nodos),
   3 repositorios ECR y el par de llaves SSH.

> También se puede ejecutar localmente con `terraform init && terraform apply` dentro de
> `infra/terraform`, usando las credenciales del Learner Lab como variables de entorno.

### 3.3 Pipeline CI/CD (build → push → deploy)
El workflow **"CI/CD - Build, Push y Deploy a EKS"** (`ci-cd.yml`) se ejecuta automáticamente
con cada `push` a `main` sobre la carpeta `proyecto semestral/`, y consta de 3 jobs:

1. **build-backends**: compila y publica en ECR las imágenes de `backend-ventas` y
   `backend-despacho`, etiquetadas con el SHA del commit y `latest`.
2. **deploy-backends**: aplica el namespace, despliega MySQL (ventas/despacho) y los dos
   backends en EKS, espera el `rollout` y obtiene los **hostnames públicos** de sus
   Load Balancers.
3. **build-deploy-frontend**: compila el frontend inyectando las URLs públicas obtenidas en
   el paso anterior, publica la imagen en ECR y despliega el `Deployment`/`Service` del
   frontend, mostrando al final la URL pública de acceso.

### 3.4 Verificación manual (kubectl)
```bash
aws eks update-kubeconfig --name proyecto-semestral-eks --region us-east-1

kubectl get nodes                          # >= 2 nodos en estado Ready
kubectl get pods -n proyecto-semestral     # todos los pods Running
kubectl get svc -n proyecto-semestral      # URLs públicas (EXTERNAL-IP) de frontend y backends
kubectl get hpa -n proyecto-semestral      # estado del autoscaling
kubectl logs deploy/backend-ventas -n proyecto-semestral
```

## 4. Autoscaling (HPA)

| Servicio          | Min réplicas | Max réplicas | Métrica / Umbral             |
|--------------------|:-----------:|:-------------:|-------------------------------|
| backend-ventas     | 2           | 6             | CPU 60% / Memoria 75%         |
| backend-despacho   | 2           | 6             | CPU 60% / Memoria 75%         |
| frontend           | 2           | 5             | CPU 60%                       |

**Justificación del umbral (60% CPU)**: en cargas Java/Spring Boot, un umbral conservador (60%)
da margen para que el HPA reaccione **antes** de que la aplicación empiece a degradar tiempos de
respuesta (las JVM tardan algunos segundos en levantar nuevas réplicas). El mínimo de 2 réplicas
garantiza alta disponibilidad incluso sin carga (si un pod falla, el otro sigue respondiendo).

Para probar el autoscaling en vivo se puede generar carga con `hey` o `ab`:
```bash
hey -z 2m -c 50 http://<URL_BACKEND_VENTAS>:8082/api/v1/ventas
kubectl get hpa -n proyecto-semestral -w
```

## 5. Mapeo con la rúbrica (Pauta EP3)

| Indicador | Cómo se cumple |
|-----------|----------------|
| **IE1 / Configuración del clúster (EKS)** | `infra/terraform/main.tf`: VPC propia, 2 subredes en distintas AZ, Internet Gateway, Security Group, clúster EKS + Node Group con 2-4 nodos `t3.medium`, roles IAM (`LabRole`). |
| **IE2 / Despliegue Frontend + Backend** | `infra/k8s/03,04,05-*.yaml`: `Deployment` por servicio, imágenes desde ECR, variables de entorno (datasource), `Service` tipo `LoadBalancer`, comunicación Front→Back vía URLs públicas inyectadas en build. |
| **IE3 / Autoscaling** | `HorizontalPodAutoscaler` (CPU/Memoria) en los 3 servicios, ver tabla arriba, con justificación de umbrales. |
| **IE4 / Pipeline CI/CD (build→push→deploy)** | `.github/workflows/ci-cd.yml`: 3 jobs encadenados, build Docker, push a ECR, deploy a EKS, espera de rollout y de Load Balancers. |
| **IE5 / Gestión de Secrets** | Credenciales AWS Academy almacenadas como **GitHub Secrets** (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`), nunca en el código. Login a ECR vía `aws-actions/amazon-ecr-login`. |
| **IE6 / Análisis de logs y métricas** | Ver sección 6 (Análisis crítico) y comandos `kubectl logs`, `kubectl top pods`, duración de cada job visible en la pestaña Actions. |
| **IE7 / Validación funcional (Front→Back)** | El job `build-deploy-frontend` imprime las 3 URLs públicas finales; se valida navegando al frontend y verificando que las operaciones CRUD de Ventas/Despachos respondan correctamente. |

## 6. Análisis crítico del proceso

**Problemas encontrados y decisiones tomadas:**
- *Comunicación Frontend → Backend en un entorno orquestado*: el frontend original usaba URLs
  `http://localhost:8081/8082`, válidas solo en `docker-compose` local. Se resolvió creando un
  módulo `src/config/api.js` con variables `import.meta.env.VITE_API_*`, e inyectando las URLs
  reales (Load Balancers de EKS) como *build-args* de Docker en el pipeline.
- *Orden de despliegue*: el frontend depende de conocer las URLs de los backends **antes** de
  compilarse. Se resolvió dividiendo el pipeline en 3 jobs secuenciales: backends primero
  (esperando a que el LB tenga `hostname`), frontend después.
- *Persistencia de datos*: se agregaron `PersistentVolumeClaim` para ambas instancias de MySQL,
  evitando pérdida de datos en reinicios de pod.
- *Roles IAM en AWS Academy*: no es posible crear roles nuevos, por lo que se reutiliza `LabRole`
  tanto para el clúster EKS como para el Node Group.

**Lecciones aprendidas:**
- La orquestación con Kubernetes/EKS resuelve automáticamente el reinicio de pods caídos
  (`livenessProbe`) y el balanceo de carga entre réplicas, algo que `docker-compose` no ofrece.
- El uso de `Service type: LoadBalancer` simplifica la exposición pública, aunque en un escenario
  productivo real se recomienda un único **Application Load Balancer + Ingress Controller**
  para reducir costos (un ELB por servicio es más caro).

**Proyección a un escenario productivo (Innovatech Chile):**
- Reemplazar los 3 `LoadBalancer` por un único **AWS Load Balancer Controller + Ingress**, con
  un dominio propio y certificados TLS (ACM).
- Migrar las credenciales temporales de AWS Academy a roles IAM permanentes (OIDC entre GitHub
  Actions y AWS, sin secrets estáticos).
- Migrar MySQL a **Amazon RDS** (gestionado, con backups automáticos y alta disponibilidad
  Multi-AZ), eliminando los `PersistentVolumeClaim` locales.
- Añadir `ConfigMaps`/`Secrets` de Kubernetes para las credenciales de base de datos en lugar de
  variables de entorno en texto plano.

## 7. Desarrollo local (docker-compose)

Para desarrollo y pruebas sin AWS:
```bash
cd "proyecto semestral"
docker-compose up --build
# Frontend:           http://localhost:3000
# Backend Despacho:   http://localhost:8081
# Backend Ventas:     http://localhost:8082
```
