# Fix Terraform Backend Configuration Change Error

## Error Message
```
Error: Backend configuration changed
A change in the backend configuration has been detected
```

## Solution Options

### Option 1: Start Fresh (Recommended for New Setup)

If you don't have existing Terraform state to preserve, reconfigure the backend:

```bash
cd /home/ubuntu/E2E-Devops-Project/EKS-Terraform/eks
terraform init -reconfigure
```

This will:
- Reconfigure the backend to use the new S3 bucket
- Start with a fresh state file
- No migration needed

### Option 2: Migrate Existing State (If You Have Existing Infrastructure)

If you have existing Terraform-managed infrastructure and want to migrate the state:

**Step 1: Verify the old bucket has state**
```bash
# Check if old bucket exists and has state
aws s3 ls s3://dev-aman-tf-bucket/eks/terraform.tfstate 2>/dev/null
```

**Step 2: If state exists, migrate it**
```bash
cd /home/ubuntu/E2E-Devops-Project/EKS-Terraform/eks
terraform init -migrate-state
```

**Step 3: Follow the prompts**
- Terraform will ask you to confirm the migration
- Type "yes" to proceed

### Option 3: Use the Old Bucket (If You Want to Keep Existing State)

If you want to keep using the old bucket name, update `backend.tf`:

```bash
cd /home/ubuntu/E2E-Devops-Project/EKS-Terraform/eks
nano backend.tf
```

Change:
```hcl
backend "s3" {
  bucket         = "dev-aman-tf-bucket"  # Change back to old bucket
  region         = "us-east-1"
  key            = "eks/terraform.tfstate"
  dynamodb_table = "Lock-Files"
  encrypt        = true
}
```

Then run:
```bash
terraform init -reconfigure
```

---

## Recommended Approach for New Setup

Since you're likely setting up fresh infrastructure, use **Option 1**:

```bash
# 1. Ensure S3 bucket exists
aws s3api create-bucket \
    --bucket my-jenkins-tfstate-6 \
    --region us-east-1

# 2. Enable versioning
aws s3api put-bucket-versioning \
    --bucket my-jenkins-tfstate-6 \
    --versioning-configuration Status=Enabled

# 3. Enable encryption
aws s3api put-bucket-encryption \
    --bucket my-jenkins-tfstate-6 \
    --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

# 4. Create DynamoDB table
aws dynamodb create-table \
    --table-name Lock-Files \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1

# 5. Initialize Terraform with reconfigure
cd /home/ubuntu/E2E-Devops-Project/EKS-Terraform/eks
terraform init -reconfigure
```

---

## Verify Setup

After initialization, verify:

```bash
# Check Terraform initialized successfully
terraform version

# Validate configuration
terraform validate

# Review what will be created (without applying)
terraform plan -var-file="dev.tfvars"
```

---

## Troubleshooting

### Error: "Bucket does not exist"
Create the bucket first (see commands above).

### Error: "Access Denied"
Check IAM permissions for S3 and DynamoDB access.

### Error: "DynamoDB table not found"
Create the DynamoDB table (see commands above).

### Error: "State file already exists"
If you get this, you can:
- Use `-migrate-state` to migrate from old to new bucket
- Or delete the state file if starting fresh: `aws s3 rm s3://my-jenkins-tfstate-6/eks/terraform.tfstate`

---

## Next Steps

After successful initialization:
1. Review the plan: `terraform plan -var-file="dev.tfvars"`
2. Apply infrastructure: `terraform apply -var-file="dev.tfvars"`
3. Monitor the deployment (takes 15-20 minutes for EKS cluster)

