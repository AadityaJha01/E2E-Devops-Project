# Configuration Update Guide

## Your AWS Configuration

**AWS Account ID:** `215764924067`

**ECR Repository URIs:**
- Backend: `215764924067.dkr.ecr.us-east-1.amazonaws.com/backend`
- Frontend: `215764924067.dkr.ecr.us-east-1.amazonaws.com/frontend`

**EKS Cluster Name:** `dev-ap-medium-eks-cluster`

---

## What Has Been Updated

### ✅ Kubernetes Deployment Files

1. **Backend Deployment** (`Kubernetes-Manifests-file/Backend/deployment.yaml`)
   - Updated ECR image URI to: `215764924067.dkr.ecr.us-east-1.amazonaws.com/backend:1`

2. **Frontend Deployment** (`Kubernetes-Manifests-file/Frontend/deployment.yaml`)
   - Updated ECR image URI to: `215764924067.dkr.ecr.us-east-1.amazonaws.com/frontend:1`

### ✅ Jenkins Pipeline Files

The Jenkinsfiles already have the correct cluster name:
- `dev-ap-medium-eks-cluster` ✅

---

## Next Steps

### 1. Create ECR Repositories (if not already created)

```bash
# Create backend repository
aws ecr create-repository \
    --repository-name backend \
    --region us-east-1

# Create frontend repository
aws ecr create-repository \
    --repository-name frontend \
    --region us-east-1
```

### 2. Build and Push Docker Images

#### Backend Image:
```bash
cd Application-Code/backend

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 215764924067.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t backend .

# Tag image
docker tag backend:latest 215764924067.dkr.ecr.us-east-1.amazonaws.com/backend:1

# Push image
docker push 215764924067.dkr.ecr.us-east-1.amazonaws.com/backend:1
```

#### Frontend Image:
```bash
cd Application-Code/frontend

# Login to ECR (if not already logged in)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 215764924067.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t frontend .

# Tag image
docker tag frontend:latest 215764924067.dkr.ecr.us-east-1.amazonaws.com/frontend:1

# Push image
docker push 215764924067.dkr.ecr.us-east-1.amazonaws.com/frontend:1
```

### 3. Configure kubectl

```bash
# Update kubeconfig for your cluster
aws eks update-kubeconfig --name dev-ap-medium-eks-cluster --region us-east-1

# Verify connection
kubectl get nodes
```

### 4. Create ECR Image Pull Secret

```bash
# Create secret for ECR authentication
kubectl create secret docker-registry ecr-registry-secret \
    --docker-server=215764924067.dkr.ecr.us-east-1.amazonaws.com \
    --docker-username=AWS \
    --docker-password=$(aws ecr get-login-password --region us-east-1) \
    --namespace=three-tier
```

### 5. Deploy Application

```bash
# Create namespace (if not exists)
kubectl create namespace three-tier

# Deploy MongoDB first
cd Kubernetes-Manifests-file/Database
kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml
kubectl apply -f secrets.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Deploy Backend
cd ../Backend
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Deploy Frontend
cd ../Frontend
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Deploy Ingress
cd ..
kubectl apply -f ingress.yaml
```

---

## Jenkins Configuration

### Update Jenkins Credentials

1. **ACCOUNT_ID** credential:
   - Value: `215764924067`

2. **ECR_REPO1** credential:
   - Value: `frontend`

3. **ECR_REPO2** credential:
   - Value: `backend`

### Verify Pipeline Configuration

The Jenkinsfiles are already configured with:
- Cluster name: `dev-ap-medium-eks-cluster` ✅
- Region: `us-east-1` ✅

---

## Verification

### Check ECR Repositories:
```bash
aws ecr describe-repositories --region us-east-1
```

### Check EKS Cluster:
```bash
aws eks describe-cluster --name dev-ap-medium-eks-cluster --region us-east-1
```

### Check Kubernetes Deployments:
```bash
kubectl get deployments -n three-tier
kubectl get pods -n three-tier
kubectl get svc -n three-tier
```

---

## Important Notes

1. **Image Tags**: The deployments use tag `:1` for both backend and frontend. When you push new versions, update the tag (e.g., `:2`, `:3`) or use `:latest`.

2. **Jenkins Pipelines**: The Jenkins pipelines will automatically update the image tags in the deployment files when they run.

3. **Cluster Name**: The cluster name `dev-ap-medium-eks-cluster` matches the Terraform configuration. If you created a cluster with a different name, update the Jenkinsfiles.

4. **Frontend URL**: The frontend deployment has a hardcoded backend URL. Update it in `Frontend/deployment.yaml` if needed:
   ```yaml
   - name: REACT_APP_BACKEND_URL
     value: "http://your-domain.com/api/tasks"
   ```

---

## Summary

✅ **Updated Files:**
- `Kubernetes-Manifests-file/Backend/deployment.yaml`
- `Kubernetes-Manifests-file/Frontend/deployment.yaml`

✅ **Already Correct:**
- Jenkins pipeline cluster names
- EKS cluster configuration

🎯 **Action Required:**
1. Create ECR repositories
2. Build and push Docker images
3. Configure kubectl
4. Deploy application

