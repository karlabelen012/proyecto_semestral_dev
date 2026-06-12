# No se almacenan credenciales de AWS aqui.
# Se utilizan las credenciales temporales de AWS Academy (Learner Lab)
# configuradas como Secrets en GitHub Actions:
#   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN

variable "aws_region" {
  description = "Region de AWS donde se despliega la infraestructura"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre base del proyecto, usado como prefijo de los recursos"
  type        = string
  default     = "proyecto-semestral"
}

variable "cluster_name" {
  description = "Nombre del cluster EKS"
  type        = string
  default     = "proyecto-semestral-eks"
}

variable "eks_version" {
  description = "Version de Kubernetes para el cluster EKS"
  type        = string
  default     = "1.29"
}

variable "key_pair_name" {
  description = "Nombre del key pair SSH para los nodos worker de EKS"
  type        = string
  default     = "proyecto-semestral-nodes-key"
}

variable "node_instance_type" {
  description = "Tipo de instancia EC2 para los nodos worker del cluster"
  type        = string
  default     = "t3.medium"
}

variable "node_desired_size" {
  description = "Cantidad deseada de nodos worker (>=2 para alta disponibilidad)"
  type        = number
  default     = 2
}

variable "node_min_size" {
  description = "Cantidad minima de nodos worker"
  type        = number
  default     = 2
}

variable "node_max_size" {
  description = "Cantidad maxima de nodos worker (limite superior del autoscaling de infraestructura)"
  type        = number
  default     = 4
}
