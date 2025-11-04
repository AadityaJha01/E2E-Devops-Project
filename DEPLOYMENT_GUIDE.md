# 🚀 Complete Deployment Guide - Three-Tier Application on AWS EKS

This comprehensive guide will walk you through deploying a Three-Tier Web Application (React + Node.js + MongoDB) on AWS EKS using Jenkins, Terraform, Docker, Kubernetes, Prometheus, and Grafana.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Account Setup](#aws-account-setup)
3. [Step 1: Create S3 Bucket and DynamoDB for Terraform State](#step-1-create-s3-bucket-and-dynamodb-for-terraform-state)
4. [Step 2: Deploy Jenkins Server using Terraform](#step-2-deploy-jenkins-server-using-terraform)
5. [Step 3: Configure Jenkins](#step-3-configure-jenkins)
6. [Step 4: Create ECR Repositories](#step-4-create-ecr-repositories)
7. [Step 5: Deploy EKS Cluster using Terraform](#step-5-deploy-eks-cluster-using-terraform)
8. [Step 6: Configure kubectl and Deploy Application](#step-6-configure-kubectl-and-deploy-application)
9. [Step 7: Setup Prometheus & Grafana](#step-7-setup-prometheus--grafana)
10. [Step 8: Configure Jenkins Pipelines](#step-8-configure-jenkins-pipelines)
11. [Step 9: Test the Complete CI/CD Pipeline](#step-9-test-the-complete-cicd-pipeline)
12. [Cost Optimization Tips](#cost-optimization-tips)
13. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ An AWS account (free tier eligible)
- ✅ AWS CLI installed and configured
- ✅ Terraform installed (v1.9.3 or compatible)
- ✅ kubectl installed
- ✅ Git installed
- ✅ A GitHub account and repository (or fork this repository)
- ✅ Basic knowledge of AWS, Kubernetes, and Docker

### Install AWS CLI (if not installed)

```bash
# Windows
curl "https://awscli.amazonaws.com/awscli-exe-windows-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Linux/Mac
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Install Terraform (if not installed)

```bash
# Windows
# Download from https://developer.hashicorp.com/terraform/downloads

# Linux
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update
sudo apt install terraform -y

# Mac
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

### Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region: us-east-1
# Enter default output format: json
```

---

## AWS Account Setup

### 1. Create IAM User with Required Permissions

1. Go to AWS Console → IAM → Users → Create User
2. Name: `devops-user`
3. Attach policies:
   - `AmazonEC2FullAccess`
   - `AmazonS3FullAccess`
   - `AmazonEKSClusterPolicy`
   - `AmazonEKSWorkerNodePolicy`
   - `AmazonEKS_CNI_Policy`
   - `AmazonEC2ContainerRegistryFullAccess`
   - `IAMFullAccess` (for Terraform)
   - `AmazonDynamoDBFullAccess`
   - `AmazonVPCFullAccess`
   - `AmazonRoute53FullAccess`
   - `ElasticLoadBalancingFullAccess`

4. Create Access Key:
   - Go to Security Credentials tab
   - Create Access Key
   - **SAVE THE ACCESS KEY ID AND SECRET ACCESS KEY** (you'll need them)

### 2. Create EC2 Key Pair

1. Go to AWS Console → EC2 → Key Pairs → Create Key Pair
2. Name: `eks-jenkins-key` (or use your existing key name)
3. Key pair type: RSA
4. Private key file format: `.pem` (for Linux/Mac) or `.ppk` (for Windows/PuTTY)
5. Download and save the key file securely

**Note:** Update `Jenkins-Server-TF/variables.tfvars` with your key pair name.

---

## Step 1: Create S3 Bucket and DynamoDB for Terraform State

### Create S3 Bucket for Terraform State

```bash
aws s3api create-bucket \
    --bucket my-jenkins-tfstate-6 \
    --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket my-jenkins-tfstate-6 \
    --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
    --bucket my-jenkins-tfstate-6 \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }'

# Block public access
aws s3api put-public-access-block \
    --bucket my-jenkins-tfstate-6 \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### Create DynamoDB Table for State Locking

```bash
aws dynamodb create-table \
    --table-name Lock-Files \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1

# Verify table exists
aws dynamodb describe-table --table-name Lock-Files --region us-east-1
```

---

## Step 2: Deploy Jenkins Server using Terraform

### 1. Navigate to Jenkins Server Terraform Directory

```bash
cd Jenkins-Server-TF
```

### 2. Update Variables

Edit `variables.tfvars` and update:
- `key-name`: Your EC2 key pair name (e.g., `eks-jenkins-key`)
- Other variables as needed

### 3. Initialize and Apply Terraform

```bash
# Initialize Terraform
terraform init

# Review the plan
terraform plan -var-file="variables.tfvars"

# Apply (creates Jenkins server)
terraform apply -var-file="variables.tfvars"
```

**Expected Output:**
- VPC with public subnet
- Security group allowing SSH (22) and Jenkins (8080)
- EC2 instance (t3.medium) with Jenkins and tools installed
- IAM role and instance profile for Jenkins

**Wait for 5-10 minutes** for Jenkins to install and start.

### 4. Get Jenkins Server Details

```bash
# Get public IP
terraform output

# Or from AWS Console
# EC2 → Instances → Select Jenkins server → Copy Public IPv4 address
```

### 5. Access Jenkins Initial Setup

1. Open browser: `http://<JENKINS_PUBLIC_IP>:8080`
2. Get initial admin password:
   ```bash
   # SSH into Jenkins server
   ssh -i your-key.pem ubuntu@<JENKINS_PUBLIC_IP>
   
   # Get password
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
3. Install suggested plugins
4. Create admin user (save credentials)
5. Save Jenkins URL

---

## Step 3: Configure Jenkins

### 1. Install Required Jenkins Plugins

Go to: **Manage Jenkins → Manage Plugins → Available**

Install these plugins:
- ✅ **Pipeline**
- ✅ **Git**
- ✅ **Docker Pipeline**
- ✅ **AWS Steps**
- ✅ **Credentials Binding**
- ✅ **Pipeline Utility Steps**
- ✅ **GitHub Plugin**

Restart Jenkins after installation.

### 2. Configure AWS Credentials in Jenkins

1. Go to: **Manage Jenkins → Manage Credentials → (global)**
2. Add Credentials:
   - **Kind**: `AWS Credentials`
   - **ID**: `aws-creds`
   - **Access Key ID**: Your AWS Access Key ID
   - **Secret Access Key**: Your AWS Secret Access Key
   - Click **OK**

### 3. Configure GitHub Credentials

1. Go to: **Manage Jenkins → Manage Credentials → (global)**
2. Add Credentials:
   - **Kind**: `Secret text`
   - **ID**: `GITHUB`
   - **Secret**: Your GitHub Personal Access Token
   - Click **OK**

   To create GitHub Personal Access Token:
   - GitHub → Settings → Developer settings → Personal access tokens → Generate new token
   - Select scopes: `repo`, `admin:repo_hook`

### 4. Configure Jenkins Credentials for Pipelines

Go to: **Manage Jenkins → Manage Credentials → (global)**

Add these credentials (as Secret text):

1. **ACCOUNT_ID** (ID: `ACCOUNT_ID`)
   - Value: Your AWS Account ID
   - Get it: `aws sts get-caller-identity --query Account --output text`

2. **ECR_REPO1** (ID: `ECR_REPO1`)
   - Value: `frontend` (or your frontend ECR repo name)

3. **ECR_REPO2** (ID: `ECR_REPO2`)
   - Value: `backend` (or your backend ECR repo name)

4. **github** (ID: `github`)
   - Value: Your GitHub Personal Access Token (same as GITHUB)

### 5. Configure Jenkins Tools

Go to: **Manage Jenkins → Tools**

1. **JDK**:
   - Name: `jdk`
   - Version: Java 17 (or install JDK 17 on Jenkins server)

2. **Node.js**:
   - Name: `nodejs`
   - Version: Node.js 18.x or 20.x

3. **Git**:
   - Path to Git executable: `git` (usually already configured)

---

## Step 4: Create ECR Repositories

### Create ECR Repositories for Frontend and Backend

```bash
# Create frontend repository
aws ecr create-repository \
    --repository-name frontend \
    --region us-east-1

# Create backend repository
aws ecr create-repository \
    --repository-name backend \
    --region us-east-1

# Get repository URIs
aws ecr describe-repositories --region us-east-1
```

**Note:** Save the repository URIs. Format: `<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/frontend`

---

## Step 5: Deploy EKS Cluster using Terraform

### 1. Navigate to EKS Terraform Directory

```bash
cd EKS-Terraform/eks
```

### 2. Review and Update Configuration

The `dev.tfvars` file is already optimized for free tier:
- Instance type: `t3.small` (free tier eligible)
- Minimal nodes: 1 on-demand node
- Spot instances: 0 (disabled to save costs)

You can modify `dev.tfvars` if needed.

### 3. Initialize and Apply Terraform

```bash
# Initialize Terraform
terraform init

# Review the plan (this will take a few minutes)
terraform plan -var-file="dev.tfvars"

# Apply (creates EKS cluster - takes 15-20 minutes)
terraform apply -var-file="dev.tfvars"
```

**Expected Output:**
- VPC with public and private subnets
- EKS cluster
- Node group with 1 t3.small instance
- IAM roles and policies
- Security groups

**Wait for 15-20 minutes** for EKS cluster to be fully ready.

### 4. Get Cluster Name

```bash
# Get cluster name
terraform output

# Or from AWS Console
# EKS → Clusters → Note the cluster name
# Format: dev-ap-medium-eks-cluster
```

---

## Step 6: Configure kubectl and Deploy Application

### 1. Update kubeconfig

```bash
# Get cluster name (from terraform output or AWS Console)
CLUSTER_NAME="dev-ap-medium-eks-cluster"
REGION="us-east-1"

# Update kubeconfig
aws eks update-kubeconfig --name $CLUSTER_NAME --region $REGION

# Verify connection
kubectl get nodes
```

### 2. Create Namespace

```bash
kubectl create namespace three-tier
```

### 3. Create ECR Image Pull Secret

```bash
# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"

# Login to ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Create secret for ECR
kubectl create secret docker-registry ecr-registry-secret \
    --docker-server=$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com \
    --docker-username=AWS \
    --docker-password=$(aws ecr get-login-password --region $REGION) \
    --namespace=three-tier
```

### 4. Create MongoDB Secrets

```bash
kubectl create secret generic mongo-sec \
    --from-literal=username=admin \
    --from-literal=password=your-secure-password \
    --namespace=three-tier
```

### 5. Deploy MongoDB

```bash
cd Kubernetes-Manifests-file/Database

# Deploy PersistentVolume
kubectl apply -f pv.yaml

# Deploy PersistentVolumeClaim
kubectl apply -f pvc.yaml

# Deploy MongoDB
kubectl apply -f deployment.yaml

# Deploy MongoDB Service
kubectl apply -f service.yaml

# Verify MongoDB is running
kubectl get pods -n three-tier
kubectl get svc -n three-tier
```

### 6. Build and Push Initial Docker Images

#### Build and Push Backend Image

```bash
cd Application-Code/backend

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"

# Login to ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build image
docker build -t backend .

# Tag image
docker tag backend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/backend:1

# Push image
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/backend:1
```

#### Build and Push Frontend Image

```bash
cd Application-Code/frontend

# Login to ECR (if not already logged in)
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build image
docker build -t frontend .

# Tag image
docker tag frontend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/frontend:1

# Push image
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/frontend:1
```

### 7. Update Kubernetes Manifests with Your Account ID

```bash
# Update backend deployment
cd Kubernetes-Manifests-file/Backend
sed -i "s/407622020962/$ACCOUNT_ID/g" deployment.yaml

# Update frontend deployment
cd ../Frontend
sed -i "s/407622020962/$ACCOUNT_ID/g" deployment.yaml
```

### 8. Deploy Backend

```bash
cd Kubernetes-Manifests-file/Backend

# Deploy backend
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Verify
kubectl get pods -n three-tier
kubectl get svc -n three-tier
```

### 9. Deploy Frontend

```bash
cd Kubernetes-Manifests-file/Frontend

# Deploy frontend
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Verify
kubectl get pods -n three-tier
kubectl get svc -n three-tier
```

### 10. Install AWS Load Balancer Controller

```bash
# Install using Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install AWS Load Balancer Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=dev-ap-medium-eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# Note: You may need to create IAM service account for the controller
# Refer to AWS documentation for detailed setup
```

### 11. Deploy Ingress

```bash
cd Kubernetes-Manifests-file

# Update ingress.yaml with your domain (or use default)
kubectl apply -f ingress.yaml

# Get Load Balancer URL
kubectl get ingress -n three-tier
```

**Note:** The ingress will create an Application Load Balancer. You can access the application via the ALB DNS name or configure a custom domain.

---

## Step 7: Setup Prometheus & Grafana

### 1. Install Helm (if not installed)

```bash
# On Jenkins server or local machine
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
# Or
sudo snap install helm --classic
```

### 2. Add Prometheus Helm Repository

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

### 3. Install kube-prometheus-stack (includes Prometheus & Grafana)

```bash
# Create monitoring namespace
kubectl create namespace monitoring

# Install Prometheus and Grafana
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set prometheus.prometheusSpec.resources.requests.memory=512Mi \
  --set prometheus.prometheusSpec.resources.requests.cpu=250m \
  --set grafana.resources.requests.memory=256Mi \
  --set grafana.resources.requests.cpu=100m

# Wait for pods to be ready
kubectl get pods -n monitoring -w
```

### 4. Access Grafana Dashboard

```bash
# Get Grafana admin password
kubectl get secret --namespace monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo

# Port forward to access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

1. Open browser: `http://localhost:3000`
2. Username: `admin`
3. Password: (from command above)

### 5. Access Prometheus UI

```bash
# Port forward to access Prometheus
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
```

1. Open browser: `http://localhost:9090`

### 6. Configure ServiceMonitor for Application Metrics (Optional)

To monitor your application, you can create ServiceMonitor resources. This is optional but recommended.

---

## Step 8: Configure Jenkins Pipelines

### 1. Create Backend Pipeline

1. Go to Jenkins → **New Item**
2. Name: `backend-pipeline`
3. Type: **Pipeline**
4. Click **OK**

5. In Pipeline configuration:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: Your GitHub repository URL
   - **Credentials**: Select `GITHUB` credential
   - **Branch**: `*/main` or `*/master`
   - **Script Path**: `Jenkins-Pipeline-Code/Jenkinsfile-Backend`

6. Click **Save**

### 2. Create Frontend Pipeline

1. Go to Jenkins → **New Item**
2. Name: `frontend-pipeline`
3. Type: **Pipeline**
4. Click **OK**

5. In Pipeline configuration:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: Your GitHub repository URL
   - **Credentials**: Select `GITHUB` credential
   - **Branch**: `*/main` or `*/master`
   - **Script Path**: `Jenkins-Pipeline-Code/Jenkinsfile-Frontend`

6. Click **Save**

### 3. Update Jenkinsfile with Your Repository

Update the repository URL in both Jenkinsfiles:
- `Jenkins-Pipeline-Code/Jenkinsfile-Backend`
- `Jenkins-Pipeline-Code/Jenkinsfile-Frontend`

Change:
```groovy
git credentialsId: 'GITHUB', url: 'https://github.com/YOUR_USERNAME/YOUR_REPO.git'
```

And update:
```groovy
GIT_REPO_NAME = "YOUR_REPO_NAME"
GIT_USER_NAME = "YOUR_GITHUB_USERNAME"
```

---

## Step 9: Test the Complete CI/CD Pipeline

### 1. Trigger Backend Pipeline

1. Go to Jenkins → `backend-pipeline`
2. Click **Build Now**
3. Monitor the build:
   - ✅ Checkout from Git
   - ✅ Trivy File Scan
   - ✅ Docker Image Build
   - ✅ ECR Image Pushing
   - ✅ Trivy Image Scan
   - ✅ Update Deployment file
   - ✅ Deploy to EKS

### 2. Trigger Frontend Pipeline

1. Go to Jenkins → `frontend-pipeline`
2. Click **Build Now**
3. Monitor the build process

### 3. Verify Deployment

```bash
# Check pods
kubectl get pods -n three-tier

# Check services
kubectl get svc -n three-tier

# Check ingress
kubectl get ingress -n three-tier

# Get application URL
kubectl get ingress -n three-tier -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}'
```

### 4. Access Application

Open the ALB DNS name in your browser (from ingress output).

---

## Cost Optimization Tips

### Estimated Costs (Free Tier Eligible)

- **EKS Cluster**: ~$0.10/hour = ~$2.40/day
- **EC2 (t3.medium)**: ~$0.04/hour = ~$0.96/day
- **EC2 (t3.small EKS node)**: ~$0.02/hour = ~$0.48/day
- **Load Balancer**: ~$0.0225/hour = ~$0.54/day
- **EBS Storage**: ~$0.10/GB/month
- **Data Transfer**: Minimal for testing

**Total: ~$4-5/day** (within $50 for 4 days)

### Cost Saving Tips

1. **Stop Jenkins server when not in use**:
   ```bash
   # Stop EC2 instance
   aws ec2 stop-instances --instance-ids <INSTANCE_ID>
   ```

2. **Use smaller instance types** (already configured):
   - Jenkins: t3.medium (can use t3.small if needed)
   - EKS nodes: t3.small

3. **Delete resources after testing**:
   ```bash
   # Destroy Jenkins infrastructure
   cd Jenkins-Server-TF
   terraform destroy -var-file="variables.tfvars"
   
   # Destroy EKS infrastructure
   cd EKS-Terraform/eks
   terraform destroy -var-file="dev.tfvars"
   ```

4. **Monitor costs in AWS Console**:
   - Go to AWS Cost Explorer
   - Set up billing alerts

---

## Troubleshooting

### Jenkins Issues

**Problem: Cannot access Jenkins UI**
- ✅ Check security group allows port 8080
- ✅ Check Jenkins service is running: `sudo systemctl status jenkins`
- ✅ Check firewall: `sudo ufw status`

**Problem: Jenkins plugins fail to install**
- ✅ Check internet connectivity
- ✅ Restart Jenkins: `sudo systemctl restart jenkins`

### EKS Issues

**Problem: kubectl cannot connect to cluster**
- ✅ Verify AWS credentials: `aws sts get-caller-identity`
- ✅ Update kubeconfig: `aws eks update-kubeconfig --name <CLUSTER_NAME> --region <REGION>`
- ✅ Check IAM permissions

**Problem: Pods stuck in Pending**
- ✅ Check node resources: `kubectl describe nodes`
- ✅ Check pod events: `kubectl describe pod <POD_NAME> -n three-tier`
- ✅ Verify node capacity: `kubectl top nodes`

**Problem: Cannot pull images from ECR**
- ✅ Verify ECR secret exists: `kubectl get secrets -n three-tier`
- ✅ Recreate ECR secret if needed
- ✅ Check IAM permissions for ECR

### Pipeline Issues

**Problem: Pipeline fails at Docker build**
- ✅ Check Docker is installed: `docker --version`
- ✅ Check Docker daemon is running: `sudo systemctl status docker`
- ✅ Verify Jenkins user has Docker permissions: `sudo usermod -aG docker jenkins`

**Problem: Pipeline fails at ECR push**
- ✅ Verify AWS credentials in Jenkins
- ✅ Check ECR repository exists
- ✅ Verify IAM permissions for ECR

**Problem: Pipeline fails at kubectl deploy**
- ✅ Verify kubeconfig is configured on Jenkins server
- ✅ Check cluster name matches: `aws eks list-clusters`
- ✅ Verify IAM permissions for EKS

### Application Issues

**Problem: Application not accessible**
- ✅ Check ingress status: `kubectl get ingress -n three-tier`
- ✅ Check ALB status in AWS Console
- ✅ Verify pods are running: `kubectl get pods -n three-tier`
- ✅ Check service endpoints: `kubectl get endpoints -n three-tier`

**Problem: Backend cannot connect to MongoDB**
- ✅ Check MongoDB pod: `kubectl get pods -n three-tier | grep mongodb`
- ✅ Verify MongoDB service: `kubectl get svc -n three-tier | grep mongodb`
- ✅ Check connection string in backend deployment: `kubectl get deployment api -n three-tier -o yaml`

---

## Next Steps

1. **Set up monitoring alerts** in Prometheus
2. **Create custom Grafana dashboards** for application metrics
3. **Configure webhook triggers** for automatic pipeline execution
4. **Set up backup strategy** for MongoDB data
5. **Implement blue-green deployment** strategy
6. **Add SSL/TLS certificates** for HTTPS

---

## Summary

You have successfully deployed:
- ✅ Jenkins CI/CD server
- ✅ AWS EKS Kubernetes cluster
- ✅ Three-tier application (React + Node.js + MongoDB)
- ✅ Prometheus & Grafana monitoring
- ✅ Automated CI/CD pipelines
- ✅ AWS Load Balancer for application access

**Congratulations! 🎉** Your DevOps project is complete and demonstrates the use of:
- AWS & AWS Console
- EKS (Elastic Kubernetes Service)
- Kubernetes
- Docker
- Jenkins
- Terraform
- Prometheus
- Grafana

---

**Remember to stop or delete resources when not in use to avoid unexpected charges!**

For questions or issues, refer to the troubleshooting section or check the AWS documentation.

