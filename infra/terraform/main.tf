terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

#########################
# IAM (AWS Academy LabRole)
# En AWS Academy no se pueden crear roles IAM nuevos,
# por lo que se reutiliza el rol "LabRole" ya existente
# tanto para el cluster EKS como para el Node Group.
#########################

data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

#########################
# VPC
#########################

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# Subred publica A (para el clúster EKS y los nodos)
resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name                                          = "${var.project_name}-public-a"
    "kubernetes.io/role/elb"                      = "1"
    "kubernetes.io/cluster/${var.cluster_name}"   = "shared"
  }
}

# Subred publica B (segunda AZ -> alta disponibilidad, requerido por EKS)
resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name                                          = "${var.project_name}-public-b"
    "kubernetes.io/role/elb"                      = "1"
    "kubernetes.io/cluster/${var.cluster_name}"   = "shared"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

#########################
# SECURITY GROUP (cluster + nodos)
#########################

resource "aws_security_group" "eks_sg" {
  name        = "${var.project_name}-eks-sg"
  description = "Security group para el cluster EKS y los Load Balancers"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Trafico HTTP hacia los servicios (Frontend / Backends) via ALB/NLB"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-eks-sg"
  }
}

#########################
# EKS CLUSTER
#########################

resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  role_arn = data.aws_iam_role.lab_role.arn
  version  = var.eks_version

  vpc_config {
    subnet_ids              = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_group_ids      = [aws_security_group.eks_sg.id]
    endpoint_public_access  = true
    endpoint_private_access = false
  }

  tags = {
    Name = var.cluster_name
  }
}

#########################
# EKS NODE GROUP
# >= 2 nodos para alta disponibilidad y soporte de autoscaling (HPA)
#########################

resource "aws_eks_node_group" "workers" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-workers"
  node_role_arn   = data.aws_iam_role.lab_role.arn
  subnet_ids      = [aws_subnet.public_a.id, aws_subnet.public_b.id]

  scaling_config {
    desired_size = var.node_desired_size
    max_size      = var.node_max_size
    min_size      = var.node_min_size
  }

  instance_types = [var.node_instance_type]
  capacity_type  = "ON_DEMAND"

  # SSH opcional hacia los nodos worker (Bastion / depuracion).
  # La key se crea mas abajo con tls_private_key.
  remote_access {
    ec2_ssh_key               = aws_key_pair.nodes_key.key_name
    source_security_group_ids = [aws_security_group.eks_sg.id]
  }

  tags = {
    Name = "${var.project_name}-worker-node"
  }

  depends_on = [aws_eks_cluster.main]
}

#########################
# SSH KEY PAIR (acceso a los nodos worker via EC2 Instance Connect / SSH)
#########################

resource "tls_private_key" "nodes" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "nodes_key" {
  key_name   = var.key_pair_name
  public_key = tls_private_key.nodes.public_key_openssh
}

#########################
# ECR REPOSITORIES
#########################

resource "aws_ecr_repository" "backend_ventas" {
  name                 = "${var.project_name}-backend-ventas"
  force_delete         = true
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "backend_despacho" {
  name                 = "${var.project_name}-backend-despacho"
  force_delete         = true
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "${var.project_name}-frontend"
  force_delete         = true
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
