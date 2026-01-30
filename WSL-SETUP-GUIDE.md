# EventHub CI/CD Setup Guide - Step-by-Step with Expected Outputs

## Prerequisites Check

### Step 1: Verify Docker
```bash
docker --version
```
**Expected Output:**
```
Docker version 24.0.x, build xxxxxxx
```

### Step 2: Verify Jenkins
```bash
sudo systemctl status jenkins
```
**Expected Output:**
```
● jenkins.service - Jenkins Continuous Integration Server
   Loaded: loaded (/lib/systemd/system/jenkins.service; enabled; vendor preset: enabled)
   Active: active (running) since Thu 2026-01-30 10:15:32 UTC; 2h 15min ago
```
Press `q` to exit.

### Step 3: Verify Terraform
```bash
terraform version
```
**Expected Output:**
```
Terraform v1.7.x
on linux_amd64
```

---

## Part A: Install Ansible

### Step 4: Update package list
```bash
sudo apt update
```
**Expected Output:**
```
Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease
Get:2 http://archive.ubuntu.com/ubuntu jammy-updates InRelease [119 kB]
...
Reading package lists... Done
```

### Step 5: Install AnsibleV
```bash
sudo apt install -y ansible
```
**Expected Output:**
```
Reading package lists... Done
Building dependency tree... Done
...
Setting up ansible (2.x.x)
```

### Step 6: Verify Ansible installation
```bash
ansible --version
```
**Expected Output:**
```
ansible [core 2.14.x]
  config file = /etc/ansible/ansible.cfg
  configured module search path = ['/home/username/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python3/dist-packages/ansible
  executable location = /usr/bin/ansible
  python version = 3.10.x
```

---

## Part B: Configure Jenkins User Permissions

### Step 7: Add Jenkins to Docker group
```bash
sudo usermod -aG docker jenkins
```
**Expected Output:**
```
(No output means success)
```

### Step 8: Verify Jenkins is in Docker group
```bash
groups jenkins
```
**Expected Output:**
```
jenkins : jenkins docker
```
(You should see "docker" in the list)

### Step 9: Restart Jenkins service
```bash
sudo systemctl restart jenkins
```
**Expected Output:**
```
(No output means success)
```

### Step 10: Wait 30 seconds, then verify Jenkins restarted
```bash
sleep 30
sudo systemctl status jenkins
```
**Expected Output:**
```
● jenkins.service - Jenkins Continuous Integration Server
   Active: active (running) since Thu 2026-01-30 12:45:10 UTC; 30s ago
```

### Step 11: Test Docker access as Jenkins user
```bash
sudo -u jenkins docker ps
```
**Expected Output:**
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```
(Empty list is fine - no errors means Docker access works)

---

## Part C: Create SSH Keys for Jenkins

### Step 12: Create .ssh directory for Jenkins
```bash
sudo -u jenkins mkdir -p /var/lib/jenkins/.ssh
```
**Expected Output:**
```
(No output means success)
```

### Step 13: Generate SSH key pair
```bash
sudo -u jenkins ssh-keygen -t ed25519 -f /var/lib/jenkins/.ssh/id_ed25519 -N '' -C "jenkins@wsl"
```
**Expected Output:**
```
Generating public/private ed25519 key pair.
Your identification has been saved in /var/lib/jenkins/.ssh/id_ed25519
Your public key has been saved in /var/lib/jenkins/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx jenkins@wsl
The key's randomart image is:
+--[ED25519 256]--+
|    . o+*.       |
|   . . =+o       |
...
+----[SHA256]-----+
```

### Step 14: Set correct permissions
```bash
sudo chmod 700 /var/lib/jenkins/.ssh
sudo chmod 600 /var/lib/jenkins/.ssh/id_ed25519
sudo chown -R jenkins:jenkins /var/lib/jenkins/.ssh
```
**Expected Output:**
```
(No output means success)
```

### Step 15: Verify permissions
```bash
ls -la /var/lib/jenkins/.ssh/
```
**Expected Output:**
```
total 16
drwx------ 2 jenkins jenkins 4096 Jan 30 12:50 .
drwxr-xr-x 8 jenkins jenkins 4096 Jan 30 12:48 ..
-rw------- 1 jenkins jenkins  411 Jan 30 12:50 id_ed25519
-rw-r--r-- 1 jenkins jenkins   99 Jan 30 12:50 id_ed25519.pub
```

### Step 16: Display PUBLIC key (you'll need this for EC2)
```bash
sudo cat /var/lib/jenkins/.ssh/id_ed25519.pub
```
**Expected Output:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx jenkins@wsl
```
**⚠️ IMPORTANT: Copy this entire line - you'll add it to EC2 next!**

---

## Part D: Configure EC2 Instance

### Step 17: SSH into your EC2 instance (manual step)
```bash
# Replace with your EC2 IP
ssh ubuntu@<YOUR-EC2-PUBLIC-IP>
```
**Expected Output:**
```
Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.x.x-xxxx-aws x86_64)
...
ubuntu@ip-172-31-x-x:~$
```

### Step 18: On EC2, add Jenkins public key to authorized_keys
```bash
# Paste the public key you copied from Step 16
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxxxxx... jenkins@wsl" >> ~/.ssh/authorized_keys
```
**Expected Output:**
```
(No output means success)
```

### Step 19: On EC2, verify authorized_keys
```bash
cat ~/.ssh/authorized_keys
```
**Expected Output:**
```
ssh-rsa AAAAB3NzaC1yc2E... (existing keys)
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxxxxx... jenkins@wsl (new key)
```

### Step 20: On EC2, set permissions
```bash
chmod 600 ~/.ssh/authorized_keys
```
**Expected Output:**
```
(No output means success)
```

### Step 21: On EC2, install Docker and docker-compose
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu
```
**Expected Output:**
```
...
Setting up docker.io (24.x.x)
Setting up docker-compose (1.x.x)
Created symlink /etc/systemd/system/multi-user.target.wants/docker.service
```

### Step 22: On EC2, verify Docker works
```bash
# Logout and login again for group to take effect
exit
ssh ubuntu@<YOUR-EC2-PUBLIC-IP>
docker ps
```
**Expected Output:**
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

### Step 23: Exit EC2 (return to WSL)
```bash
exit
```
**Expected Output:**
```
logout
Connection to <EC2-IP> closed.
```

---

## Part E: Test SSH Connection from Jenkins to EC2

### Step 24: Test SSH as Jenkins user (replace with your EC2 IP)
```bash
sudo -u jenkins ssh -i /var/lib/jenkins/.ssh/id_ed25519 -o StrictHostKeyChecking=no ubuntu@<YOUR-EC2-IP> "echo 'SSH connection successful'"
```
**Expected Output:**
```
Warning: Permanently added '<YOUR-EC2-IP>' (ED25519) to the list of known hosts.
SSH connection successful
```

✅ If you see "SSH connection successful", Jenkins can now connect to EC2!

---

## Part F: Configure Jenkins Credentials (Web UI)

### Step 25: Get Jenkins initial admin password
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```
**Expected Output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```
(32-character hex string)

### Step 26: Access Jenkins web UI
Open browser and go to:
```
http://localhost:8080
```
**Expected Output:**
```
Unlock Jenkins page with password field
```

### Step 27: Get Jenkins private key for credential setup
```bash
sudo cat /var/lib/jenkins/.ssh/id_ed25519
```
**Expected Output:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
...
(multiple lines of base64 text)
...
-----END OPENSSH PRIVATE KEY-----
```
**⚠️ IMPORTANT: Copy this ENTIRE output including BEGIN/END lines**

### Step 28: In Jenkins UI, navigate to credentials
1. Click **Manage Jenkins** (left sidebar)
2. Click **Credentials**
3. Click **(global)** domain
4. Click **Add Credentials** (left sidebar)

### Step 29: Add AWS Credentials
- **Kind**: `Username with password`
- **Scope**: `Global`
- **Username**: `<your-aws-access-key-id>` (starts with AKIA...)
- **Password**: `<your-aws-secret-access-key>`
- **ID**: `aws-creds` ⚠️ MUST BE EXACTLY THIS
- **Description**: `AWS credentials for Terraform`
- Click **Create**

**Expected Result:**
```
Credential created successfully
```

### Step 30: Add SSH Credentials for EC2
Click **Add Credentials** again:
- **Kind**: `SSH Username with private key`
- **Scope**: `Global`
- **ID**: `jenkins-ssh` ⚠️ MUST BE EXACTLY THIS
- **Description**: `Jenkins SSH key for EC2`
- **Username**: `ubuntu`
- **Private Key**: Select **Enter directly**
  - Click **Add**
  - Paste the private key from Step 27 (entire key including BEGIN/END)
- Click **Create**

**Expected Result:**
```
Credential created successfully
```

### Step 31: Verify credentials exist
In Jenkins → Manage Jenkins → Credentials, you should see:
```
ID              Description
aws-creds       AWS credentials for Terraform
jenkins-ssh     Jenkins SSH key for EC2
```

---

## Part G: Verify Terraform Output Configuration

### Step 32: Check if main.tf has server_ip output
```bash
cd /mnt/d/GitHub/EventHub
grep -A 3 'output "server_ip"' main.tf
```
**Expected Output:**
```
output "server_ip" {
  value       = aws_instance.eventhub_server.public_ip
  description = "Public IP of EC2 instance"
}
```

**If you see "output not found" or no output**, you need to add it to main.tf:

### Step 33: Read your main.tf to find EC2 resource name
```bash
grep -E "resource.*aws_instance" main.tf
```
**Expected Output:**
```
resource "aws_instance" "eventhub_server" {
```
(Note the resource name after the dot)

### Step 34: Add output to main.tf (if missing)
```bash
cat >> main.tf << 'EOF'

output "server_ip" {
  value       = aws_instance.eventhub_server.public_ip
  description = "Public IP of EC2 instance"
}
EOF
```
**Expected Output:**
```
(No output means success)
```

### Step 35: Verify output was added
```bash
tail -5 main.tf
```
**Expected Output:**
```
output "server_ip" {
  value       = aws_instance.eventhub_server.public_ip
  description = "Public IP of EC2 instance"
}
```

---

## Part H: Setup ngrok for GitHub Webhooks

### Step 36: Check if ngrok is installed
```bash
which ngrok
```
**Expected Output (if installed):**
```
/usr/local/bin/ngrok
```
**Expected Output (if NOT installed):**
```
(no output)
```

### Step 37: Install ngrok (if needed)
```bash
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
rm ngrok-v3-stable-linux-amd64.tgz
```
**Expected Output:**
```
--2026-01-30 13:00:00--  https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
...
ngrok
```

### Step 38: Verify ngrok installation
```bash
ngrok version
```
**Expected Output:**
```
ngrok version 3.x.x
```

### Step 39: Authenticate ngrok (get token from https://dashboard.ngrok.com/get-started/your-authtoken)
```bash
ngrok config add-authtoken <YOUR_NGROK_AUTH_TOKEN>
```
**Expected Output:**
```
Authtoken saved to configuration file: /home/username/.ngrok2/ngrok.yml
```

### Step 40: Start ngrok tunnel (in a separate terminal)
```bash
ngrok http 8080
```
**Expected Output:**
```
ngrok                                                                   

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:8080

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**⚠️ IMPORTANT: Copy the Forwarding URL (e.g., `https://abc123.ngrok-free.app`)**

### Step 41: Verify ngrok is forwarding
Open a NEW terminal and run:
```bash
curl http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url'
```
**Expected Output:**
```
https://abc123.ngrok-free.app
```

---

## Part I: Configure GitHub Webhook

### Step 42: Get your ngrok URL programmatically
```bash
curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok-free\.app'
```
**Expected Output:**
```
https://abc123.ngrok-free.app
```

### Step 43: Configure webhook in GitHub (manual)
1. Go to: `https://github.com/<your-username>/EventHub/settings/hooks`
2. Click **Add webhook**
3. **Payload URL**: `https://abc123.ngrok-free.app/github-webhook/`
4. **Content type**: `application/json`
5. **Secret**: (leave blank)
6. **Which events**: Select **Just the push event**
7. **Active**: ✅ (checked)
8. Click **Add webhook**

**Expected Result:**
```
✅ Webhook created successfully
Recent Deliveries: (will show deliveries after first push)
```

---

## Part J: Configure Jenkins Pipeline Job

### Step 44: Create pipeline job in Jenkins UI
1. Go to Jenkins: `http://localhost:8080`
2. Click **New Item**
3. Enter name: `EventHub-Pipeline`
4. Select **Pipeline**
5. Click **OK**

### Step 45: Configure pipeline
In the configuration page:

**Build Triggers section:**
- ✅ Check **GitHub hook trigger for GITScm polling**

**Pipeline section:**
- **Definition**: `Pipeline script from SCM`
- **SCM**: `Git`
- **Repository URL**: `https://github.com/<your-username>/EventHub.git`
- **Credentials**: (none - if public repo)
- **Branch Specifier**: `*/main` (or `*/master`)
- **Script Path**: `Jenkinsfile`

Click **Save**

**Expected Result:**
```
Configuration saved
You should see the pipeline job in the dashboard
```

---

## Part K: Test the Complete Pipeline

### Step 46: Make a test commit
```bash
cd /mnt/d/GitHub/EventHub
echo "# Test commit for CI/CD" >> README.md
git add README.md
git commit -m "test: trigger Jenkins CI/CD pipeline"
```
**Expected Output:**
```
[main abc1234] test: trigger Jenkins CI/CD pipeline
 1 file changed, 1 insertion(+)
```

### Step 47: Push to GitHub
```bash
git push origin main
```
**Expected Output:**
```
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
...
To https://github.com/<your-username>/EventHub.git
   abc1234..def5678  main -> main
```

### Step 48: Check ngrok received the webhook
In the terminal running ngrok, you should see:
```
POST /github-webhook/              200 OK
```

### Step 49: Check Jenkins job started
Go to Jenkins UI: `http://localhost:8080/job/EventHub-Pipeline/`

**Expected Result:**
```
You should see a new build (#1) running or completed
```

### Step 50: View pipeline console output
Click on build **#1** → **Console Output**

**Expected Output (abbreviated):**
```
Started by GitHub push by <your-username>
Checking out Revision abc1234...
[Pipeline] stage (Checkout)
[Pipeline] echo
📥 Checking out code from GitHub...
[Pipeline] stage (Test Frontend)
🧪 Running frontend tests...
[Pipeline] stage (Build Docker Images)
🔨 Building backend and frontend images...
[Pipeline] stage (Terraform: Init & Apply)
🌱 Running Terraform init and apply...
Terraform has been successfully initialized!
aws_instance.eventhub_server: Creating...
aws_instance.eventhub_server: Creation complete after 45s
Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
[Pipeline] stage (Get server IP from Terraform)
🔍 Capturing server IP from Terraform output...
Server IP: 3.x.x.x
[Pipeline] stage (Ansible Deploy to EC2)
🚀 Deploying to EC2 with Ansible...

PLAY [Jenkins-driven deploy to EC2] ******************************************

TASK [Stop and remove existing containers] ************************************
changed: [3.x.x.x]

TASK [Prune unused images] ****************************************************
changed: [3.x.x.x]

TASK [Copy docker-compose.yml to remote] **************************************
changed: [3.x.x.x]

TASK [Start services via docker-compose] **************************************
changed: [3.x.x.x]

PLAY RECAP ********************************************************************
3.x.x.x : ok=10   changed=8    unreachable=0    failed=0    skipped=0

[Pipeline] echo
✅ Pipeline completed successfully!
Finished: SUCCESS
```

---

## Verification Checklist

Use this to verify everything is working:

```bash
# ✅ Ansible installed
ansible --version

# ✅ Jenkins has Docker access
sudo -u jenkins docker ps

# ✅ SSH key exists
ls -la /var/lib/jenkins/.ssh/id_ed25519

# ✅ Jenkins can SSH to EC2
sudo -u jenkins ssh -i /var/lib/jenkins/.ssh/id_ed25519 ubuntu@<EC2-IP> "echo OK"

# ✅ Terraform output configured
terraform output server_ip

# ✅ ngrok is running
curl -s http://localhost:4040/api/tunnels | grep public_url

# ✅ Jenkins credentials exist
# Check in Jenkins UI: Manage Jenkins → Credentials
# Should see: aws-creds, jenkins-ssh

# ✅ Pipeline job exists
# Check in Jenkins UI: Dashboard
# Should see: EventHub-Pipeline

# ✅ GitHub webhook configured
# Check: https://github.com/<your-username>/EventHub/settings/hooks
# Should see: https://xxx.ngrok-free.app/github-webhook/
```

---

## Common Issues and Solutions

### Issue: "Permission denied (publickey)" when Jenkins tries to SSH to EC2
**Solution:**
```bash
# Verify public key is on EC2
ssh ubuntu@<EC2-IP> "cat ~/.ssh/authorized_keys | grep jenkins"

# If not found, re-add it:
sudo cat /var/lib/jenkins/.ssh/id_ed25519.pub
# Copy output and add to EC2: echo "..." >> ~/.ssh/authorized_keys
```

### Issue: "docker: command not found" in Ansible playbook
**Solution:**
```bash
# On EC2, install Docker
ssh ubuntu@<EC2-IP>
sudo apt update && sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu
exit
```

### Issue: Terraform "Error: No valid credential sources found"
**Solution:**
```bash
# Verify aws-creds in Jenkins UI has correct AWS keys
# Or test Terraform manually:
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
terraform init
terraform plan
```

### Issue: GitHub webhook shows "Failed to connect"
**Solution:**
```bash
# Check ngrok is still running
curl http://localhost:4040/api/tunnels

# If not running, restart ngrok:
ngrok http 8080

# Update GitHub webhook URL with new ngrok URL
```

---

## Success! 🎉

When everything works, your workflow is:

1. Make code changes locally
2. `git commit` and `git push`
3. GitHub webhook triggers Jenkins automatically
4. Jenkins:
   - Runs tests
   - Builds Docker images
   - Provisions/updates EC2 with Terraform
   - Deploys to EC2 with Ansible
5. Your app is live on EC2!

**Zero clicks required!** ✨
