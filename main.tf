terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-1"  # This must match the region you chose in 'aws configure'
}

# 1. Security Group: Allow Traffic to EventHub
resource "aws_security_group" "eventhub_sg" {
  name        = "eventhub_security_group"
  description = "Allow SSH, Frontend, and Backend traffic"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "React Frontend"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Node Backend"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 2. Upload your SSH Key to AWS
resource "aws_key_pair" "deployer" {
  key_name   = "eventhub-key"
  public_key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDVJkYhW8bK0ODq2+SlCACfU+A+hoKXx+s1TO7FLjoj7 jenkins@wsl"
}

# 3. Create the Server (EC2)
resource "aws_instance" "app_server" {
  ami           = "ami-04b4f1a9cf54c11d0" # Ubuntu 24.04 (US-East-1)
  instance_type = "t3.micro"              # Free Tier
  key_name      = aws_key_pair.deployer.key_name
  security_groups = [aws_security_group.eventhub_sg.name]

  # Install Docker automatically when the server starts
  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io docker-compose-v2
              usermod -aG docker ubuntu
              EOF

  tags = {
    Name = "EventHub-Server"
  }
}

# 4. Show the Server IP at the end
output "server_ip" {
  value = aws_instance.app_server.public_ip
}
