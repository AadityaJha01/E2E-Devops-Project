# Next Steps: Deploy Application to EKS

## ✅ Current Status
- ✅ EKS cluster created and accessible
- ✅ kubectl working
- ✅ Namespace `three-tier` created
- ✅ ACCOUNT_ID and REGION variables set

## Step-by-Step Deployment

### Step 1: Create ECR Repositories (if not already created)

```bash
# Create backend repository
aws ecr create-repository --repository-name backend --region us-east-1

# Create frontend repository
aws ecr create-repository --repository-name frontend --region us-east-1

# Verify repositories
aws ecr describe-repositories --region us-east-1
```

### Step 2: Create ECR Image Pull Secret

```bash
# Login to ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Create secret for Kubernetes to pull images from ECR
kubectl create secret docker-registry ecr-registry-secret \
    --docker-server=$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com \
    --docker-username=AWS \
    --docker-password=$(aws ecr get-login-password --region $REGION) \
    --namespace=three-tier

# Verify secret
kubectl get secrets -n three-tier
```

### Step 3: Create MongoDB Secrets

```bash
# Create MongoDB username and password secret
kubectl create secret generic mongo-sec \
    --from-literal=username=admin \
    --from-literal=password=your-secure-password-123 \
    --namespace=three-tier

# Verify secret
kubectl get secrets -n three-tier | grep mongo-sec
```

### Step 4: Build and Push Docker Images

#### Build Backend Image:

```bash
cd /home/ubuntu/E2E-Devops-Project/Application-Code/backend

# Login to ECR (if not already logged in)
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build image
docker build -t backend .

# Tag image
docker tag backend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/backend:1

# Push image
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/backend:1
```

#### Build Frontend Image:

```bash
cd /home/ubuntu/E2E-Devops-Project/Application-Code/frontend

# Login to ECR (if not already logged in)
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build image
docker build -t frontend .

# Tag image
docker tag frontend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/frontend:1

# Push image
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/frontend:1
```

### Step 5: Deploy MongoDB

```bash
cd /home/ubuntu/E2E-Devops-Project/Kubernetes-Manifests-file/Database

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
kubectl get svc -n three-tier | grep mongodb
```

**Wait for MongoDB pod to be ready:**
```bash
kubectl wait --for=condition=ready pod -l app=mongodb -n three-tier --timeout=300s
```

### Step 6: Deploy Backend

```bash
cd /home/ubuntu/E2E-Devops-Project/Kubernetes-Manifests-file/Backend

# Deploy backend
kubectl apply -f deployment.yaml

# Deploy backend service
kubectl apply -f service.yaml

# Verify backend is running
kubectl get pods -n three-tier | grep api
kubectl get svc -n three-tier | grep api
```

**Check backend logs:**
```bash
kubectl logs -f deployment/api -n three-tier
```

### Step 7: Deploy Frontend

```bash
cd /home/ubuntu/E2E-Devops-Project/Kubernetes-Manifests-file/Frontend

# Deploy frontend
kubectl apply -f deployment.yaml

# Deploy frontend service
kubectl apply -f service.yaml

# Verify frontend is running
kubectl get pods -n three-tier | grep frontend
kubectl get svc -n three-tier | grep frontend
```

### Step 8: Install AWS Load Balancer Controller (For Ingress)

```bash
# Install Helm (if not installed)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Add Helm repository
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install AWS Load Balancer Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=dev-ap-medium-eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# Note: You may need to create IAM service account for the controller
# Check: https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html
```

### Step 9: Deploy Ingress

```bash
cd /home/ubuntu/E2E-Devops-Project/Kubernetes-Manifests-file

# Deploy ingress
kubectl apply -f ingress.yaml

# Get Load Balancer URL
kubectl get ingress -n three-tier

# Wait for ALB to be created (takes 2-3 minutes)
kubectl get ingress -n three-tier -w
```

### Step 10: Verify Everything

```bash
# Check all pods are running
kubectl get pods -n three-tier

# Check all services
kubectl get svc -n three-tier

# Check ingress
kubectl get ingress -n three-tier

# Get application URL
kubectl get ingress -n three-tier -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}'
```

## Quick Command Summary

```bash
# Set variables
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"

# 1. Create ECR repos
aws ecr create-repository --repository-name backend --region $REGION
aws ecr create-repository --repository-name frontend --region $REGION

# 2. Create secrets
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
kubectl create secret docker-registry ecr-registry-secret --docker-server=$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com --docker-username=AWS --docker-password=$(aws ecr get-login-password --region $REGION) --namespace=three-tier
kubectl create secret generic mongo-sec --from-literal=username=admin --from-literal=password=securepass123 --namespace=three-tier

# 3. Build and push images
cd Application-Code/backend
docker build -t backend .
docker tag backend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/backend:1
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/backend:1

cd ../frontend
docker build -t frontend .
docker tag frontend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/frontend:1
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/frontend:1

# 4. Deploy MongoDB
cd Kubernetes-Manifests-file/Database
kubectl apply -f pv.yaml pvc.yaml deployment.yaml service.yaml

# 5. Deploy Backend
cd ../Backend
kubectl apply -f deployment.yaml service.yaml

# 6. Deploy Frontend
cd ../Frontend
kubectl apply -f deployment.yaml service.yaml

# 7. Deploy Ingress
cd ..
kubectl apply -f ingress.yaml

# 8. Get URL
kubectl get ingress -n three-tier
```

## Troubleshooting

### If pods are not starting:
```bash
# Check pod status
kubectl describe pod <pod-name> -n three-tier

# Check logs
kubectl logs <pod-name> -n three-tier
```

### If images can't be pulled:
```bash
# Verify ECR secret
kubectl get secret ecr-registry-secret -n three-tier -o yaml

# Recreate secret if needed
kubectl delete secret ecr-registry-secret -n three-tier
kubectl create secret docker-registry ecr-registry-secret --docker-server=$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com --docker-username=AWS --docker-password=$(aws ecr get-login-password --region $REGION) --namespace=three-tier
```

### If MongoDB connection fails:
```bash
# Check MongoDB service
kubectl get svc mongodb-svc -n three-tier

# Check MongoDB logs
kubectl logs deployment/mongodb -n three-tier
```

## Next: Setup Monitoring

After deployment, you can set up Prometheus & Grafana as described in the DEPLOYMENT_GUIDE.md.

