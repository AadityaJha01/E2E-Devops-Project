# Fix MongoDB Connection Refused Error

## Problem
Backend getting: `connect ECONNREFUSED 172.20.73.200:27017`

This means the service IP is resolving, but MongoDB isn't accepting connections.

## Diagnosis Steps

Run these commands to diagnose:

```bash
# 1. Check MongoDB pod is actually running
kubectl get pods -n three-tier | grep mongodb

# 2. Check MongoDB logs
kubectl logs deployment/mongodb -n three-tier

# 3. Check MongoDB service
kubectl get svc mongodb-svc -n three-tier

# 4. Check service endpoints
kubectl get endpoints mongodb-svc -n three-tier

# 5. Test connection from a pod
kubectl run -it --rm debug --image=busybox --restart=Never -n three-tier -- nc -zv mongodb-svc 27017
```

## Common Issues and Fixes

### Issue 1: MongoDB Still Initializing

MongoDB might still be starting up. Wait and check:

```bash
# Wait for MongoDB to be fully ready
kubectl wait --for=condition=ready pod -l app=mongodb -n three-tier --timeout=300s

# Check logs
kubectl logs deployment/mongodb -n three-tier
```

### Issue 2: MongoDB Authentication Enabled but Connection String Doesn't Use It

If MongoDB was initialized with authentication, we need to either:
- Remove authentication from MongoDB, OR
- Update connection string to include credentials

### Issue 3: MongoDB Not Listening on Port

Check if MongoDB is actually listening:

```bash
# Exec into MongoDB pod
kubectl exec -it deployment/mongodb -n three-tier -- mongosh

# Or check if port is open
kubectl exec -it deployment/mongodb -n three-tier -- netstat -tlnp
```

## Quick Fix: Recreate MongoDB Without Authentication

Since we're using `USE_DB_AUTH=false`, MongoDB should also be without auth:

```bash
# 1. Delete MongoDB (this will delete data)
kubectl delete deployment mongodb -n three-tier
kubectl delete pvc mongo-volume-claim -n three-tier
kubectl delete pv mongo-volume 2>/dev/null || true

# 2. Remove auth env vars from deployment
# Edit Database/deployment.yaml to remove MONGO_INITDB_ROOT_USERNAME and MONGO_INITDB_ROOT_PASSWORD

# 3. Recreate
cd /home/ubuntu/E2E-Devops-Project/Kubernetes-Manifests-file/Database

# Remove auth from deployment.yaml temporarily
sed -i '/MONGO_INITDB_ROOT_USERNAME/,/MONGO_INITDB_ROOT_PASSWORD/d' deployment.yaml

# Or manually edit deployment.yaml to remove lines 30-39 (the env section with auth)

kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# 4. Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n three-tier --timeout=300s

# 5. Restart backend
kubectl rollout restart deployment/api -n three-tier
```

## Alternative: Update MongoDB Deployment to Remove Auth

Update the deployment.yaml to remove authentication environment variables:

```yaml
# Remove these lines from deployment.yaml:
env: 
  - name: MONGO_INITDB_ROOT_USERNAME
    valueFrom:
      secretKeyRef:
        name: mongo-sec
        key: username
  - name: MONGO_INITDB_ROOT_PASSWORD
    valueFrom:
      secretKeyRef:
        name: mongo-sec
        key: password
```

Then MongoDB will start without authentication, matching the backend configuration.

## Verify Fix

After recreating MongoDB:

```bash
# Check MongoDB is running
kubectl get pods -n three-tier | grep mongodb

# Check backend logs
kubectl logs deployment/api -n three-tier | grep -i "connected\|error"

# Should see: "Connected to database." ✅
```

