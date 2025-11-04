# ⚡ Quick Start Guide

A condensed version of the deployment process. For detailed instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## Prerequisites Checklist

- [ ] AWS Account with IAM user (credentials configured)
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Terraform installed
- [ ] kubectl installed
- [ ] GitHub repository (fork or use this repo)
- [ ] EC2 Key Pair created in AWS

## Step 1: Create S3 & DynamoDB for Terraform State

```bash
# S3 Bucket
aws s3api create-bucket --bucket my-jenkins-tfstate-6 --region us-east-1
aws s3api put-bucket-versioning --bucket my-jenkins-tfstate-6 --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket my-jenkins-tfstate-6 --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

# DynamoDB Table
aws dynamodb create-table --table-name Lock-Files --attribute-definitions AttributeName=LockID,AttributeType=S --key-schema AttributeName=LockID,KeyType=HASH --billing-mode PAY_PER_REQUEST --region us-east-1
```

## Step 2: Deploy Jenkins Server

```bash
cd Jenkins-Server-TF
# Update variables.tfvars with your key-name
terraform init
terraform apply -var-file="variables.tfvars"
# Wait 5-10 minutes, then get public IP from output
```

**Access Jenkins:**
- URL: `http://<JENKINS_IP>:8080`
- Get password: `ssh -i key.pem ubuntu@<JENKINS_IP> sudo cat /var/lib/jenkins/secrets/initialAdminPassword`

## Step 3: Configure Jenkins

### Install Plugins:
- Pipeline, Git, Docker Pipeline, AWS Steps, Credentials Binding

### Add Credentials (Manage Jenkins → Credentials):
1. **AWS Credentials** (ID: `aws-creds`)
   - Access Key ID & Secret Access Key

2. **GitHub Token** (ID: `GITHUB`)
   - Personal Access Token with `repo` scope

3. **AWS Account ID** (ID: `ACCOUNT_ID`)
   - Run: `aws sts get-caller-identity --query Account --output text`

4. **ECR Repos** (ID: `ECR_REPO1` = `frontend`, ID: `ECR_REPO2` = `backend`)

5. **GitHub Token** (ID: `github`) - Same as GITHUB

## Step 4: Create ECR Repositories

```bash
aws ecr create-repository --repository-name frontend --region us-east-1
aws ecr create-repository --repository-name backend --region us-east-1
```

## Step 5: Deploy EKS Cluster

```bash
cd EKS-Terraform/eks
terraform init
terraform apply -var-file="dev.tfvars"
# Wait 15-20 minutes
```

**Get cluster name:**
```bash
terraform output
# Or from AWS Console: EKS → Clusters
```

## Step 6: Configure kubectl & Deploy App

```bash
# Update kubeconfig
aws eks update-kubeconfig --name dev-ap-medium-eks-cluster --region us-east-1

# Create namespace
kubectl create namespace three-tier

# Create ECR secret
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
kubectl create secret docker-registry ecr-registry-secret \
  --docker-server=$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com \
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password --region us-east-1) \
  --namespace=three-tier

# Create MongoDB secret
kubectl create secret generic mongo-sec \
  --from-literal=username=admin \
  --from-literal=password=your-password \
  --namespace=three-tier

# Deploy MongoDB
cd Kubernetes-Manifests-file/Database
kubectl apply -f pv.yaml pvc.yaml deployment.yaml service.yaml

# Build and push images (from local or Jenkins)
cd Application-Code/backend
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker build -t backend .
docker tag backend:latest $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/backend:1
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/backend:1

# Repeat for frontend...

# Update deployment.yaml with your ACCOUNT_ID
sed -i "s/407622020962/$ACCOUNT_ID/g" Kubernetes-Manifests-file/Backend/deployment.yaml
sed -i "s/407622020962/$ACCOUNT_ID/g" Kubernetes-Manifests-file/Frontend/deployment.yaml

# Deploy backend & frontend
kubectl apply -f Kubernetes-Manifests-file/Backend/
kubectl apply -f Kubernetes-Manifests-file/Frontend/
kubectl apply -f Kubernetes-Manifests-file/ingress.yaml
```

## Step 7: Setup Prometheus & Grafana

```bash
# Install Helm (if not installed)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Add repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install
kubectl create namespace monitoring
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set prometheus.prometheusSpec.resources.requests.memory=512Mi \
  --set grafana.resources.requests.memory=256Mi

# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Username: admin
# Password: kubectl get secret --namespace monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode
```

## Step 8: Create Jenkins Pipelines

1. **New Item** → **Pipeline** → Name: `backend-pipeline`
   - Pipeline script from SCM
   - Git repository: Your repo URL
   - Script Path: `Jenkins-Pipeline-Code/Jenkinsfile-Backend`

2. **New Item** → **Pipeline** → Name: `frontend-pipeline`
   - Pipeline script from SCM
   - Git repository: Your repo URL
   - Script Path: `Jenkins-Pipeline-Code/Jenkinsfile-Frontend`

3. **Update Jenkinsfiles** with your:
   - GitHub repository URL
   - GitHub username
   - Repository name

## Step 9: Test Pipeline

1. Go to `backend-pipeline` → **Build Now**
2. Monitor build stages
3. Verify deployment: `kubectl get pods -n three-tier`

## Access Application

```bash
# Get ALB URL
kubectl get ingress -n three-tier
# Open URL in browser
```

## Cleanup (When Done)

```bash
# Destroy EKS
cd EKS-Terraform/eks
terraform destroy -var-file="dev.tfvars"

# Destroy Jenkins
cd Jenkins-Server-TF
terraform destroy -var-file="variables.tfvars"

# Delete ECR repos
aws ecr delete-repository --repository-name frontend --force --region us-east-1
aws ecr delete-repository --repository-name backend --force --region us-east-1

# Delete S3 & DynamoDB
aws s3 rm s3://my-jenkins-tfstate-6 --recursive
aws s3api delete-bucket --bucket my-jenkins-tfstate-6
aws dynamodb delete-table --table-name Lock-Files --region us-east-1
```

## Estimated Costs

- **EKS**: ~$2.40/day
- **Jenkins EC2**: ~$0.96/day
- **EKS Node**: ~$0.48/day
- **ALB**: ~$0.54/day
- **Total**: ~$4.50/day ✅

**Remember to stop/delete resources when not in use!**

---

For detailed instructions, troubleshooting, and best practices, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

