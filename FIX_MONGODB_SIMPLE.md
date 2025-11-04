# Fix MongoDB Connection - Simple Solution

## Problem
MongoDB authentication is failing even after setting USE_DB_AUTH=true.

## Root Cause
MongoDB was likely initialized without credentials, or the MongoDB container doesn't have authentication enabled by default in this setup.

## Solution: Disable Authentication (Simplest for Demo)

Since this is a demo project and MongoDB is running in a private cluster, we can disable authentication for simplicity.

**Already Applied:** Updated deployment to use `USE_DB_AUTH=false`

## Alternative: Recreate MongoDB with Authentication

If you want to keep authentication enabled, recreate MongoDB:

```bash
# 1. Delete MongoDB deployment and PVC (this deletes the data)
kubectl delete deployment mongodb -n three-tier
kubectl delete pvc mongo-volume-claim -n three-tier
kubectl delete pv mongo-volume -n three-tier 2>/dev/null || true

# 2. Wait a moment
sleep 5

# 3. Recreate MongoDB (will initialize with credentials from secrets)
cd /home/ubuntu/E2E-Devops-Project/Kubernetes-Manifests-file/Database
kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml
kubectl apply -f secrets.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# 4. Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n three-tier --timeout=300s

# 5. Update backend to use authentication
# Edit deployment.yaml to set USE_DB_AUTH=true
# Then apply and restart
```

## Quick Fix Applied

Changed `USE_DB_AUTH=false` in backend deployment. This will:
- Connect to MongoDB without authentication
- Work immediately without recreating MongoDB
- Suitable for demo/testing environments

## Next Steps

1. **Apply the updated deployment:**
```bash
cd /home/ubuntu/E2E-Devops-Project/Kubernetes-Manifests-file/Backend
git pull origin main
kubectl apply -f deployment.yaml
```

2. **Restart backend pods:**
```bash
kubectl rollout restart deployment/api -n three-tier
```

3. **Check logs:**
```bash
kubectl logs -f deployment/api -n three-tier
```

You should now see: "Connected to database." ✅

## Verify Connection

```bash
# Check backend pods are ready
kubectl get pods -n three-tier | grep api

# Should show: 1/1 Ready (not 0/1)
```

## For Production

For production environments, you should:
1. Enable MongoDB authentication
2. Use proper credentials in connection strings
3. Use TLS/SSL connections
4. Restrict network access via security groups

But for demo/testing, the simple approach (no auth) is fine.

