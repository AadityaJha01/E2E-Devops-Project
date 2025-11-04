# Fix MongoDB Pod Stuck in Pending

## Problem
MongoDB pod is stuck in `Pending` status:
```
mongodb-59797b688c-zbtnl   0/1     Pending   0          5m21s
```

## Common Causes

### 1. PVC Not Bound
The PersistentVolumeClaim might not be bound to a PersistentVolume.

### 2. Storage Issues
No available storage or storage class issues.

### 3. Node Resources
No nodes available with sufficient resources.

## Diagnosis Steps

Run these commands to diagnose:

```bash
# Check PVC status
kubectl get pvc -n three-tier

# Check PV status
kubectl get pv

# Describe the pending pod
kubectl describe pod mongodb-59797b688c-zbtnl -n three-tier

# Check node resources
kubectl describe nodes
```

## Solutions

### Solution 1: Check and Fix PVC

```bash
# Check PVC status
kubectl get pvc mongo-volume-claim -n three-tier

# If PVC is in Pending, check why
kubectl describe pvc mongo-volume-claim -n three-tier

# If PV exists but not bound, check PV
kubectl get pv mongo-volume
kubectl describe pv mongo-volume
```

### Solution 2: Delete and Recreate (Quick Fix)

If PVC/PV are the issue, delete and recreate:

```bash
# Delete MongoDB deployment
kubectl delete deployment mongodb -n three-tier

# Delete PVC (this will delete the PV too if it's dynamically provisioned)
kubectl delete pvc mongo-volume-claim -n three-tier

# Delete PV if it still exists
kubectl delete pv mongo-volume 2>/dev/null || true

# Recreate everything
cd /home/ubuntu/E2E-Devops-Project/Kubernetes-Manifests-file/Database
kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Check status
kubectl get pods -n three-tier
kubectl get pvc -n three-tier
```

### Solution 3: Use EBS CSI Driver (If PV Not Working)

If the static PV isn't working, use dynamic provisioning with EBS CSI driver:

```bash
# Check if EBS CSI driver is installed
kubectl get pods -n kube-system | grep ebs-csi

# If not installed, install it (should already be installed as an EKS addon)
# Then update PVC to use storage class
```

### Solution 4: Check Node Capacity

```bash
# Check if nodes have capacity
kubectl describe nodes

# Check node resources
kubectl top nodes
```

## Quick Fix Command

Try this first:

```bash
# Delete and recreate MongoDB
kubectl delete deployment mongodb -n three-tier
kubectl delete pvc mongo-volume-claim -n three-tier
kubectl delete pv mongo-volume 2>/dev/null || true

# Wait a moment
sleep 5

# Recreate
cd /home/ubuntu/E2E-Devops-Project/Kubernetes-Manifests-file/Database
kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Watch for pod creation
kubectl get pods -n three-tier -w
```

## Verify Fix

After recreating, check:

```bash
# Pod should be Running or at least not Pending
kubectl get pods -n three-tier | grep mongodb

# PVC should be Bound
kubectl get pvc -n three-tier

# PV should be Available or Bound
kubectl get pv
```

## Alternative: Use EmptyDir (No Persistence)

If storage is causing issues and you don't need persistence for demo:

```yaml
# In deployment.yaml, replace volumes section with:
volumes:
  - name: mongo-volume
    emptyDir: {}
```

But this means data will be lost when pod restarts.

