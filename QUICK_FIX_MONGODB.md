# Quick Fix for MongoDB Pending Pod

## Problem
MongoDB pod stuck in `Pending` status - likely PVC/PV binding issue.

## Quick Fix Steps

Run these commands:

```bash
# 1. Check current status
kubectl get pvc -n three-tier
kubectl get pv
kubectl describe pod mongodb-59797b688c-zbtnl -n three-tier

# 2. Delete everything and recreate
kubectl delete deployment mongodb -n three-tier
kubectl delete pvc mongo-volume-claim -n three-tier
kubectl delete pv mongo-pv mongo-volume 2>/dev/null || true

# 3. Pull latest changes
cd /home/ubuntu/E2E-Devops-Project
git pull origin main

# 4. Recreate with fixed PV
cd Kubernetes-Manifests-file/Database
kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# 5. Check status
kubectl get pods -n three-tier
kubectl get pvc -n three-tier
kubectl get pv
```

## What Was Fixed

1. **PV name**: Changed from `mongo-pv` to `mongo-volume` (matches PVC expectation)
2. **Removed namespace**: PVs are cluster-scoped, not namespace-scoped
3. **HostPath location**: Changed to `/tmp/mongo-data` with `DirectoryOrCreate` type
4. **Added reclaim policy**: Set to `Retain` for data safety

## Verify

After applying, check:

```bash
# PVC should be Bound
kubectl get pvc mongo-volume-claim -n three-tier

# PV should be Bound
kubectl get pv mongo-volume

# Pod should be Running (not Pending)
kubectl get pods -n three-tier | grep mongodb
```

## Alternative: Use EBS Storage (More Reliable)

If hostPath still doesn't work, use EBS CSI driver:

```yaml
# Update pvc.yaml to use storage class:
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongo-volume-claim
  namespace: three-tier
spec: 
  accessModes:  
    - ReadWriteOnce
  storageClassName: gp3  # EBS CSI driver
  resources:
    requests:
      storage: 1Gi
```

But for now, try the hostPath fix first.

