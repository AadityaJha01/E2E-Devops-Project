# Fix EKS Cluster Access Issue

## Problem
Getting timeout error when connecting to EKS cluster:
```
dial tcp 10.16.173.72:443: i/o timeout
```

## Root Cause
The EKS cluster is configured with:
- `endpoint-private-access = true` ✅
- `endpoint-public-access = false` ❌ (This is the problem!)

This means the cluster API endpoint is only accessible from within the VPC, not from the internet or other VPCs.

## Solution Options

### Option 1: Enable Public Access (Quick Fix for Testing)

**Update `EKS-Terraform/eks/dev.tfvars`:**
```hcl
endpoint-private-access = true
endpoint-public-access  = true  # Change from false to true
```

Then apply:
```bash
cd /home/ubuntu/E2E-Devops-Project/EKS-Terraform/eks
terraform apply -var-file="dev.tfvars"
```

**Security Note:** This makes the endpoint publicly accessible. You should restrict access using security groups or IP whitelisting.

### Option 2: Use AWS Systems Manager Session Manager (Recommended)

If your EC2 instance has SSM access, you can use Session Manager to connect:

```bash
# Install Session Manager plugin
wget https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb
sudo dpkg -i session-manager-plugin.deb

# Connect via SSM (if instance has SSM role)
aws ssm start-session --target <instance-id>
```

### Option 3: Use a Bastion Host in the Same VPC

1. Create a bastion host in the same VPC as the EKS cluster
2. SSH into the bastion host
3. Run kubectl commands from there

### Option 4: Use VPN or Direct Connect

Connect your network to the VPC via VPN or AWS Direct Connect.

### Option 5: Enable Public Access with Restricted Source IPs

Enable public access but restrict it to specific IP addresses using security groups.

## Quick Fix: Enable Public Access

For development/testing, enable public access:

```bash
# Update the configuration
cd /home/ubuntu/E2E-Devops-Project
git pull origin main

# Edit dev.tfvars
nano EKS-Terraform/eks/dev.tfvars
# Change: endpoint-public-access = false  →  endpoint-public-access = true

# Apply changes
cd EKS-Terraform/eks
terraform apply -var-file="dev.tfvars"
```

## Verify Security Group

After enabling public access, ensure the EKS security group allows your IP:

```bash
# Get your current IP
MY_IP=$(curl -s https://checkip.amazonaws.com)
echo "Your IP: $MY_IP"

# Check EKS security group
CLUSTER_SG=$(aws eks describe-cluster --name dev-ap-medium-eks-cluster --region us-east-1 --query 'cluster.resourcesVpcConfig.clusterSecurityGroupId' --output text)
aws ec2 describe-security-groups --group-ids $CLUSTER_SG --region us-east-1
```

## Alternative: Use EKS Cluster Endpoint via AWS CLI

You can also manage the cluster via AWS CLI without direct kubectl access:

```bash
# List nodes
aws eks list-nodegroups --cluster-name dev-ap-medium-eks-cluster --region us-east-1

# Describe cluster
aws eks describe-cluster --name dev-ap-medium-eks-cluster --region us-east-1
```

## Recommended Approach for Production

1. **Keep private access enabled** (`endpoint-private-access = true`)
2. **Enable public access with restricted IPs** (`endpoint-public-access = true` with security group rules)
3. **Use a bastion host** or VPN for secure access
4. **Use AWS Systems Manager Session Manager** for secure access

## Next Steps

1. **For immediate testing:** Enable public access (Option 1)
2. **For production:** Set up bastion host or VPN (Option 3/4)

After enabling public access, try:
```bash
kubectl get nodes
```

This should work now!

