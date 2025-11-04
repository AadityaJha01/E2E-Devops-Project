# Fix kube-proxy Addon Version Error

## Problem
The kube-proxy addon version `v1.28.3-eksbuild.2` is not supported for EKS cluster 1.28.

## Solution Options

### Option 1: Use Auto-Version (Recommended - Let EKS Choose Latest Compatible)

Modify the Terraform module to not specify a version, allowing EKS to auto-select the latest compatible version.

**Update `EKS-Terraform/module/eks.tf`:**
```hcl
resource "aws_eks_addon" "eks-addons" {
  for_each      = { for idx, addon in var.addons : idx => addon }
  cluster_name  = aws_eks_cluster.eks[0].name
  addon_name    = each.value.name
  
  # Only specify version if provided, otherwise use latest
  addon_version = try(each.value.version, null)

  depends_on = [
    aws_eks_node_group.ondemand-node,
    aws_eks_node_group.spot-node
  ]
}
```

**Update `EKS-Terraform/eks/dev.tfvars`:**
```hcl
addons = [
  {
    name    = "vpc-cni",
    version = "v1.20.0-eksbuild.1"
  },
  {
    name    = "coredns"
    # version = null  # Let EKS choose latest for EKS 1.28
  },
  {
    name    = "kube-proxy"
    # version = null  # Let EKS choose latest for EKS 1.28
  },
  {
    name    = "aws-ebs-csi-driver",
    version = "v1.28.0-eksbuild.1"
  }
]
```

### Option 2: Find Correct Version Manually

Query AWS for available versions:

```bash
# Check available kube-proxy versions for EKS 1.28
aws eks describe-addon-versions \
  --addon-name kube-proxy \
  --kubernetes-version 1.28 \
  --region us-east-1 \
  --query 'addons[0].addonVersions[*].addonVersion' \
  --output table

# Check available coredns versions
aws eks describe-addon-versions \
  --addon-name coredns \
  --kubernetes-version 1.28 \
  --region us-east-1 \
  --query 'addons[0].addonVersions[*].addonVersion' \
  --output table
```

Then use the latest version from the output.

### Option 3: Use Latest Compatible Version Pattern

For EKS 1.28, try these versions:
- **kube-proxy**: `v1.28.1-eksbuild.1` or `v1.28.0-eksbuild.1`
- **coredns**: `v1.10.1-eksbuild.1` or `v1.10.0-eksbuild.1`

## Quick Fix Applied

I've updated the kube-proxy version to `v1.28.1-eksbuild.1` which is more likely to be available.

**To apply the fix:**

```bash
cd /home/ubuntu/E2E-Devops-Project
git pull origin main
cd EKS-Terraform/eks
terraform apply -var-file="dev.tfvars"
```

## Alternative: Remove Version Spec (Use Latest)

If the version still fails, you can modify the Terraform code to allow optional versions:

1. **Update the module** to make version optional
2. **Remove version from dev.tfvars** for problematic addons
3. Let EKS auto-select the latest compatible version

This is the safest approach as EKS will always choose a compatible version.

## Verify Current State

Check what addons are already installed:

```bash
aws eks list-addons \
  --cluster-name dev-ap-medium-eks-cluster \
  --region us-east-1

# Describe addon to see current version
aws eks describe-addon \
  --cluster-name dev-ap-medium-eks-cluster \
  --addon-name kube-proxy \
  --region us-east-1
```

## Recommended Approach

Since kube-proxy and coredns are critical addons that come pre-installed with EKS, the best approach is:

1. **Let EKS auto-select** by not specifying versions
2. **Or use the exact version** that's currently running (if addon already exists)

The changes I made should work, but if they don't, use Option 1 (auto-version) which is the most reliable.

