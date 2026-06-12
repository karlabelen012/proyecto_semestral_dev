output "cluster_name" {
  description = "Nombre del cluster EKS"
  value       = aws_eks_cluster.main.name
}

output "cluster_endpoint" {
  description = "Endpoint de la API de Kubernetes"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_ca_certificate" {
  description = "Certificado CA del cluster (base64)"
  value       = aws_eks_cluster.main.certificate_authority[0].data
  sensitive   = true
}

output "ecr_backend_ventas" {
  description = "URL del repositorio ECR para el backend de ventas"
  value       = aws_ecr_repository.backend_ventas.repository_url
}

output "ecr_backend_despacho" {
  description = "URL del repositorio ECR para el backend de despachos"
  value       = aws_ecr_repository.backend_despacho.repository_url
}

output "ecr_frontend" {
  description = "URL del repositorio ECR para el frontend"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ssh_private_key_pem" {
  description = "Llave privada SSH para acceder a los nodos worker de EKS"
  value       = tls_private_key.nodes.private_key_pem
  sensitive   = true
}

output "vpc_id" {
  description = "ID de la VPC creada"
  value       = aws_vpc.main.id
}

output "node_group_name" {
  description = "Nombre del Node Group del cluster EKS"
  value       = aws_eks_node_group.workers.node_group_name
}
