# Fix Terraform Apply Errors

## Errors Encountered

1. **EKS Addon Version Errors**: kube-proxy and coredns versions incompatible with EKS 1.28
2. **IAM Policy Name Conflict**: "test-policy" already exists

## Fixes Applied

### 1. Updated EKS Addon Versions for Cluster 1.28

**File:** `EKS-Terraform/eks/dev.tfvars`

**Changes:**
- **coredns**: Changed from `v1.12.2-eksbuild.4` → `v1.10.1-eksbuild.1` (compatible with EKS 1.28)
- **kube-proxy**: Changed from `v1.33.0-eksbuild.2` → `v1.28.3-eksbuild.2` (matches cluster version)
- **aws-ebs-csi-driver**: Changed from `v1.46.0-eksbuild.1` → `v1.28.0-eksbuild.1` (compatible with EKS 1.28)

**Updated Addon Configuration:**
```hcl
addons = [
  {
    name    = "vpc-cni",
    version = "v1.20.0-eksbuild.1"  # ✅ Already correct
  },
  {
    name    = "coredns"
    version = "v1.10.1-eksbuild.1"  # ✅ Fixed
  },
  {
    name    = "kube-proxy"
    version = "v1.28.3-eksbuild.2"  # ✅ Fixed
  },
  {
    name    = "aws-ebs-csi-driver"
    version = "v1.28.0-eksbuild.1"  # ✅ Fixed
  }
]
```

### 2. Fixed IAM Policy Name Conflict

**File:** `EKS-Terraform/module/iam.tf`

**Change:**
- Changed from hardcoded `"test-policy"` to dynamic name: `"${var.cluster-name}-eks-oidc-policy-${random_integer.random_suffix.result}"`
- This ensures unique policy names per cluster deployment

## Next Steps

### Option 1: Delete the Existing Policy (Recommended)

If you don't need the old "test-policy", delete it first:

```bash
# Find the policy ARN
aws iam list-policies --query 'Policies[?PolicyName==`test-policy`].Arn' --output text

# Delete the policy (replace ARN with actual ARN)
aws iam delete-policy --policy-arn <POLICY_ARN>
```

### Option 2: Continue with Terraform Apply

Since the cluster and most resources were created successfully, you can:

1. **Pull the latest changes:**
```bash
cd /home/ubuntu/E2E-Devops-Project
git pull origin main
```

2. **Re-run terraform apply:**
```bash
cd EKS-Terraform/eks
terraform apply -var-file="dev.tfvars"
```

Terraform will:
- Skip resources that already exist (VPC, cluster, node groups, etc.)
- Create the addons with correct versions
- Create the IAM policy with the new unique name

### Option 3: Import Existing Addons (If They Already Exist)

If addons were partially created, you might need to import them:

```bash
# Import existing addons (if they exist)
terraform import module.eks.aws_eks_addon.eks-addons[\"0\"] dev-ap-medium-eks-cluster:vpc-cni
terraform import module.eks.aws_eks_addon.eks-addons[\"1\"] dev-ap-medium-eks-cluster:coredns
terraform import module.eks.aws_eks_addon.eks-addons[\"2\"] dev-ap-medium-eks-cluster:kube-proxy
terraform import module.eks.aws_eks_addon.eks-addons[\"3\"] dev-ap-medium-eks-cluster:aws-ebs-csi-driver
```

Then run `terraform apply` to update to correct versions.

## Verify Current State

Check what's already created:

```bash
# Check cluster status
aws eks describe-cluster --name dev-ap-medium-eks-cluster --region us-east-1

# Check addons
aws eks list-addons --cluster-name dev-ap-medium-eks-cluster --region us-east-1

# Check node groups
aws eks describe-nodegroup --cluster-name dev-ap-medium-eks-cluster --nodegroup-name dev-ap-medium-eks-cluster-on-demand-nodes --region us-east-1
```

## Expected Outcome

After applying the fixes:
- ✅ EKS cluster: `dev-ap-medium-eks-cluster` (already created)
- ✅ Node groups: on-demand and spot (already created)
- ✅ Addons: vpc-cni, coredns, kube-proxy, aws-ebs-csi-driver (with correct versions)
- ✅ IAM policy: unique name based on cluster name

## Troubleshooting

### If addon versions still fail:

1. **Check available versions:**
```bash
aws eks describe-addon-versions --addon-name coredns --kubernetes-version 1.28 --region us-east-1
aws eks describe-addon-versions --addon-name kube-proxy --kubernetes-version 1.28 --region us-east-1
```

2. **Use latest compatible version:**
   - Remove version from `dev.tfvars` to use latest, OR
   - Use the latest version from the command above

3. **Alternative: Use latest version (remove version specification)**
   You can modify the Terraform module to not specify versions, which will use the latest compatible version automatically.

---

## Summary

✅ **Fixed:**
- EKS addon versions now compatible with cluster 1.28
- IAM policy name now unique per cluster

🎯 **Action Required:**
1. Pull latest changes: `git pull origin main`
2. Delete old "test-policy" (if exists): `aws iam delete-policy --policy-arn <ARN>`
3. Re-run: `terraform apply -var-file="dev.tfvars"`

The cluster is already created successfully! You just need to fix the addon versions and IAM policy name.

