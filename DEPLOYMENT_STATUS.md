# Deployment Status and Next Steps

## ✅ Current Status

- ✅ MongoDB: Running (1/1 Ready)
- ✅ PVC: Bound to mongo-volume
- ✅ PV: Bound
- ⚠️ Backend: 0/1 Ready (needs restart to connect to MongoDB)

## Next Steps

### Step 1: Restart Backend Pods

```bash
# Restart backend to connect to MongoDB
kubectl rollout restart deployment/api -n three-tier

# Wait for pods to restart
kubectl get pods -n three-tier -w
# Press Ctrl+C when all pods are ready
```

### Step 2: Verify Backend Connection

```bash
# Check backend logs
kubectl logs -f deployment/api -n three-tier

# You should see: "Connected to database." ✅
# If you see authentication errors, we may need to recreate MongoDB
```

### Step 3: Check All Pods Status

```bash
kubectl get pods -n three-tier

# All pods should show: 1/1 Ready
```

### Step 4: Deploy Frontend (If Backend is Working)

```bash
cd /home/ubuntu/E2E-Devops-Project/Kubernetes-Manifests-file/Frontend

# Deploy frontend
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Verify frontend
kubectl get pods -n three-tier | grep frontend
```

### Step 5: Install AWS Load Balancer Controller (For Ingress)

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
# Check AWS documentation if this fails
```

### Step 6: Deploy Ingress

```bash
cd /home/ubuntu/E2E-Devops-Project/Kubernetes-Manifests-file

# Deploy ingress
kubectl apply -f ingress.yaml

# Get Load Balancer URL
kubectl get ingress -n three-tier

# Wait for ALB to be created (takes 2-3 minutes)
kubectl get ingress -n three-tier -w
# Press Ctrl+C when you see the ALB DNS name
```

### Step 7: Access Application

```bash
# Get application URL
ALB_URL=$(kubectl get ingress -n three-tier -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}')
echo "Application URL: http://$ALB_URL"

# Or manually check
kubectl get ingress -n three-tier
```

## Quick Command Summary

```bash
# 1. Restart backend
kubectl rollout restart deployment/api -n three-tier

# 2. Check backend logs
kubectl logs -f deployment/api -n three-tier

# 3. Verify all pods
kubectl get pods -n three-tier

# 4. Deploy frontend
cd /home/ubuntu/E2E-Devops-Project/Kubernetes-Manifests-file/Frontend
kubectl apply -f deployment.yaml service.yaml

# 5. Deploy ingress
cd ..
kubectl apply -f ingress.yaml
kubectl get ingress -n three-tier
```

## Troubleshooting

### If Backend Still Can't Connect to MongoDB

```bash
# Check MongoDB is accessible
kubectl exec -it deployment/mongodb -n three-tier -- mongosh

# If MongoDB is accessible, check backend connection string
kubectl describe deployment api -n three-tier | grep MONGO_CONN_STR

# Check MongoDB service
kubectl get svc mongodb-svc -n three-tier
```

### If Frontend Pods Not Starting

```bash
# Check frontend logs
kubectl logs deployment/frontend -n three-tier

# Check image pull
kubectl describe pod -l role=frontend -n three-tier
```

## Expected Final Status

```bash
kubectl get all -n three-tier

# Should show:
# - MongoDB: Running
# - Backend: Running (2 pods)
# - Frontend: Running
# - All services: Running
# - Ingress: With ALB DNS name
```

