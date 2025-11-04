# Fix MongoDB Authentication Issue

## Problem
Backend pods are failing to connect to MongoDB with authentication error:
```
MongoServerError: Authentication failed.
```

## Root Cause
The backend deployment has:
- ✅ MongoDB username and password from secrets
- ❌ `USE_DB_AUTH` environment variable not set
- ❌ Connection string doesn't include credentials

## Solution Applied

Updated `Kubernetes-Manifests-file/Backend/deployment.yaml` to:
1. Set `USE_DB_AUTH=true` to enable authentication
2. Keep using secrets for username/password (more secure)

## Alternative Solution (If First Doesn't Work)

If MongoDB was initialized without credentials, you may need to:

### Option 1: Recreate MongoDB with Fresh Data

```bash
# Delete MongoDB deployment and PVC
kubectl delete deployment mongodb -n three-tier
kubectl delete pvc mongo-volume-claim -n three-tier

# Delete the PV (if it's not automatically deleted)
kubectl delete pv mongo-volume -n three-tier

# Recreate everything
cd /home/ubuntu/E2E-Devops-Project/Kubernetes-Manifests-file/Database
kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml
kubectl apply -f secrets.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

### Option 2: Update Connection String to Include Credentials

If you prefer to include credentials in the connection string, update the backend deployment:

```yaml
env:
  - name: MONGO_CONN_STR
    value: mongodb://$(MONGO_USERNAME):$(MONGO_PASSWORD)@mongodb-svc:27017/todo?directConnection=true&authSource=admin
```

But this requires using a different approach since you can't directly interpolate secrets in connection strings.

### Option 3: Check MongoDB Initialization

Verify MongoDB was initialized with credentials:

```bash
# Check MongoDB logs
kubectl logs deployment/mongodb -n three-tier

# Check if MongoDB is ready
kubectl get pods -n three-tier | grep mongodb

# Exec into MongoDB pod and verify
kubectl exec -it deployment/mongodb -n three-tier -- mongosh -u admin -p password123
```

## Next Steps

1. **Apply the updated deployment:**
```bash
cd /home/ubuntu/E2E-Devops-Project/Kubernetes-Manifests-file/Backend
kubectl apply -f deployment.yaml

# Restart pods to pick up new environment variable
kubectl rollout restart deployment/api -n three-tier
```

2. **Verify the fix:**
```bash
# Check backend logs
kubectl logs -f deployment/api -n three-tier

# You should see: "Connected to database." instead of authentication error
```

3. **If still failing, recreate MongoDB:**
```bash
# Follow Option 1 above to recreate MongoDB with fresh initialization
```

## Verify MongoDB Secret

Check that the secret has the correct values:

```bash
# Decode the secret values
kubectl get secret mongo-sec -n three-tier -o jsonpath='{.data.username}' | base64 -d
echo
kubectl get secret mongo-sec -n three-tier -o jsonpath='{.data.password}' | base64 -d
echo

# Should show:
# admin
# password123
```

## Expected Result

After applying the fix, backend logs should show:
```
Connected to database.
```

And pods should be in Ready state:
```bash
kubectl get pods -n three-tier
# Should show: api-xxx-xxx    1/1     Running   0    XXs
```

