# EventHub — Jenkins CI/CD Deployment Workflow (Git Push → Production)

This document describes the **actual Jenkins-based deployment flow** for this repository, from `git push` to running containers on AWS EC2.

> Scope: **Jenkins only**. GitHub Actions deployment is not part of the production path.

---

## 1) End-to-end flow (what happens)

1. Developer runs `git push origin main`.
2. GitHub sends a **webhook** event to Jenkins.
3. Jenkins runs the pipeline defined in [Jenkinsfile](Jenkinsfile).
4. Jenkins:
   - checks out the repo
   - runs frontend tests
   - provisions/updates infrastructure with Terraform
   - builds Docker images
   - deploys to EC2 using Ansible
5. On EC2, Docker Compose starts 3 containers:
   - React frontend on port 3000
   - Node.js backend API on port 5000
   - MongoDB on an internal Docker network

---

## 2) Tools used (what + why + where)

### GitHub Webhook
- **What it is**: GitHub feature that POSTs events (like a push) to an external URL.
- **Why it’s used**: to automatically trigger Jenkins when new code is pushed.
- **Where it’s configured**: GitHub repo settings → Webhooks (not stored in this repo).
- **Where it’s “used in code”**: not in code; it triggers the Jenkins job configured in Jenkins UI.

### ngrok (Webhook tunnel)
- **What it is**: a tunneling tool that exposes your local Jenkins (running on your machine/WSL) to the public internet.
- **Why it’s used**: GitHub must reach Jenkins; ngrok gives a public HTTPS URL forwarding to `http://localhost:8080`.
- **Where it’s configured**: on the machine that runs Jenkins (command line / ngrok config). Not committed in this repo.
- **Where it’s “used in code”**: not in repository code; it’s part of runtime environment/networking.
- **Important note**: if ngrok URL changes, the GitHub webhook target URL must be updated.

### Jenkins Pipeline
- **What it is**: CI/CD orchestrator running a scripted pipeline.
- **Why it’s used**: coordinates build/test/provision/deploy steps on every push.
- **Where the pipeline is defined**: [Jenkinsfile](Jenkinsfile).
- **Key credentials referenced** (stored in Jenkins, not in repo):
  - DockerHub credentials ID: `dockerhub-credentials`
  - AWS credentials ID: `aws-creds`
  - SSH private key credentials ID: `jenkins-ssh`

### Node.js + npm
- **What it is**: runtime/package manager for frontend (React) and backend (Node API).
- **Why it’s used**: installs dependencies and runs tests/build steps.
- **Where it’s used**: Jenkins runs npm commands in the pipeline.
- **Where code lives**:
  - Frontend package config: [frontend/package.json](frontend/package.json)
  - Backend package config: [backend/package.json](backend/package.json)

### Terraform (Infrastructure as Code)
- **What it is**: declarative infrastructure provisioning.
- **Why it’s used**: ensures an EC2 instance and security group exist (and provides the current public IP).
- **Where it’s run**: Jenkins pipeline stage “Terraform: Init & Apply” in [Jenkinsfile](Jenkinsfile).
- **Where Terraform code lives**: [main.tf](main.tf).
- **Important**: Jenkins reads the EC2 public IP from Terraform output `server_ip`.

### Docker (image build)
- **What it is**: builds container images for frontend and backend.
- **Why it’s used**: produces immutable deployable artifacts.
- **Where it’s used**: Jenkins pipeline stage “Build Docker Images” in [Jenkinsfile](Jenkinsfile).
- **Where Docker build definitions live**:
  - Backend image: [backend/Dockerfile](backend/Dockerfile)
  - Frontend image: [frontend/Dockerfile](frontend/Dockerfile)

### Docker Compose (runtime orchestration on EC2)
- **What it is**: defines how containers run together on the server.
- **Why it’s used**: starts frontend + backend + mongodb with networking, healthchecks, and restart policy.
- **Where it’s used**: Ansible runs `docker compose up -d` on EC2.
- **Where Compose config lives**:
  - Production compose template: [docker-compose.prod.yml](docker-compose.prod.yml)

### Ansible (deployment automation)
- **What it is**: configuration management + remote task runner.
- **Why it’s used**: connects to EC2 over SSH, copies artifacts, and starts the Compose stack.
- **Where it’s invoked**: Jenkins pipeline stage “Ansible Deploy to EC2” in [Jenkinsfile](Jenkinsfile).
- **Which playbook is used for Jenkins deployments**: [ansible/jenkins-deploy.yml](ansible/jenkins-deploy.yml).

---

## 3) Jenkins pipeline stages (exactly what runs)

Source of truth: [Jenkinsfile](Jenkinsfile)

### Stage: Checkout
- **Tool**: Git (via Jenkins)
- **Why**: get the latest repo state for the build.

### Stage: Test Frontend
- **Tools**: Node/npm
- **Command**: `npm install` then `npm test -- --watchAll=false --ci || true`
- **Why**: sanity-check the frontend.
- **Note**: `|| true` means test failures **do not fail the pipeline** (deploy can still happen).

### Stage: Terraform: Init & Apply
- **Tools**: Terraform, AWS provider
- **Commands**: `terraform init` and `terraform apply -auto-approve`
- **Why**: ensure EC2 + security group exist.
- **Code**: [main.tf](main.tf)

### Stage: Get server IP from Terraform
- **Tools**: Terraform output
- **Command**: `terraform output -raw server_ip`
- **Why**: dynamically discover the EC2 public IP after provisioning.

### Stage: Build Docker Images
- **Tools**: Docker
- **Why**: build frontend/backend images and bundle them as `.tar` files for transfer.
- **Notes**:
  - Backend: builds `ashendeminda/eventhub-backend:latest`.
  - Frontend: builds with build-arg `REACT_APP_API_URL` pointing to `http://<EC2_IP>:5000`.
  - Images are exported to `build/backend.tar` and `build/frontend.tar`.

### Stage: Ansible Deploy to EC2
- **Tools**: Ansible + SSH + Docker Compose on EC2
- **Why**: copy compose + images to the server, load images, start services.
- **Playbook**: [ansible/jenkins-deploy.yml](ansible/jenkins-deploy.yml)
- **What the playbook does (high level)**:
  - installs Docker + docker-compose-v2 if missing
  - copies [docker-compose.prod.yml](docker-compose.prod.yml) to `/home/<user>/app/docker-compose.yml`
  - copies and `docker load`s the image tar files
  - runs `docker compose up -d --remove-orphans`

---

## 4) Runtime architecture on EC2 (what ends up running)

Source of truth: [docker-compose.prod.yml](docker-compose.prod.yml)

- **Frontend**: `ashendeminda/eventhub-frontend:latest`
  - Port: `3000:3000`
  - Reads API URL from env `REACT_APP_API_URL`.
- **Backend**: `ashendeminda/eventhub-backend:latest`
  - Port: `5000:5000`
  - Connects to MongoDB via Docker network name `mongodb`.
- **MongoDB**: `mongo:7.0`
  - Port mapping exists: `27017:27017`
  - Persistent storage via volume `mongodb_data`.

Infrastructure ports allowed by Terraform security group: [main.tf](main.tf)
- Open: `22` (SSH), `3000` (frontend), `5000` (backend)
- Not opened: `27017` (MongoDB), so it’s not reachable from the internet via SG.

---

## 5) Where deployments can diverge (common confusion)

- GitHub Actions workflow exists but is **not the Jenkins deploy path**.
  - Actions workflow file: [.github/workflows/deploy-ec2-ansible.yml](.github/workflows/deploy-ec2-ansible.yml)
  - It is currently set to `workflow_dispatch` (manual-only), so it won’t run on `git push`.

---

## 6) Quick verification checklist

After a successful Jenkins run:

- From your machine:
  - `curl http://<EC2_IP>:3000`
  - `curl http://<EC2_IP>:5000/api/health`

- On EC2 (SSH):
  - `docker ps`
  - `docker logs eventhub-backend --tail 100`
  - `docker compose -f /home/ubuntu/app/docker-compose.yml ps`
