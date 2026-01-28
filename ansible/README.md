# Ansible deployment (Option A: build on EC2)

This repo supports a simple, low-cost deployment to a single always-on EC2 instance:
- GitHub Actions triggers on push
- It runs Ansible
- Ansible SSHs into EC2, `git pull`s the repo, then runs `docker compose down` + `docker compose up -d --build`

## 1) Install Ansible in WSL (local use)

```bash
sudo apt update
sudo apt install -y ansible
```

## 2) One-time EC2 requirements
- Ubuntu instance with port `22` open to your IP (SSH)
- Ports `3000` and `5000` open to the internet (as you already do in Terraform)
- Docker installed (Terraform user_data already installs it, but Ansible also enforces it)

## 3) GitHub Secrets required
Add these in GitHub → Settings → Secrets and variables → Actions:
- `EC2_HOST` (public IP or DNS)
- `EC2_USER` (usually `ubuntu`)
- `EC2_SSH_PRIVATE_KEY` (private key contents for SSH)
- `JWT_SECRET` (backend JWT secret)

Optional:
- `REACT_APP_API_URL` (default is `http://EC2_HOST:5000`)
- `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD`, `MONGO_INITDB_DATABASE`

## 4) Run manually from WSL

Create an inventory file:
```bash
cp ansible/inventory.ini.example ansible/inventory.ini
# edit ansible/inventory.ini and set your EC2 host
```

Then run:
```bash
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml \
  --extra-vars "repo_url=https://github.com/AshenDeminda/EventHub.git repo_version=main" \
  --extra-vars "react_app_api_url=http://YOUR_EC2_PUBLIC_IP:5000" \
  --extra-vars "jwt_secret=YOUR_SECRET"
```
