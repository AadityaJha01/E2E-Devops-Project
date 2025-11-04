# Fix S3 Backend Configuration Error

## Problem
You're getting a 403 Forbidden error when running `terraform init` because:
1. The S3 bucket doesn't exist, OR
2. The IAM user doesn't have permissions to access the bucket

## Solution

### Step 1: Pull the Latest Changes

The backend configuration has been updated. Pull the latest changes:

```bash
cd /home/ubuntu/E2E-Devops-Project
git pull origin main
```

### Step 2: Create S3 Bucket and DynamoDB Table

If you haven't created the S3 bucket yet, run these commands:

```bash
# Create S3 bucket
aws s3api create-bucket \
    --bucket my-jenkins-tfstate-6 \
    --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket my-jenkins-tfstate-6 \
    --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
    --bucket my-jenkins-tfstate-6 \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }'

# Block public access
aws s3api put-public-access-block \
    --bucket my-jenkins-tfstate-6 \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Create DynamoDB table for state locking
aws dynamodb create-table \
    --table-name Lock-Files \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1

# Verify table exists
aws dynamodb describe-table --table-name Lock-Files --region us-east-1
```

### Step 3: Verify IAM Permissions

Make sure your IAM user has these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-jenkins-tfstate-6",
        "arn:aws:s3:::my-jenkins-tfstate-6/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:DescribeTable"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/Lock-Files"
    }
  ]
}
```

### Step 4: Reinitialize Terraform

```bash
cd /home/ubuntu/E2E-Devops-Project/EKS-Terraform/eks
terraform init
```

---

## Alternative: Use Your Existing Bucket

If you already have a bucket (like "dev-aman-tf-bucket") and want to use it instead:

### Option A: Update backend.tf to use your bucket

Edit `EKS-Terraform/eks/backend.tf` and change:

```hcl
backend "s3" {
  bucket         = "dev-aman-tf-bucket"  # Your existing bucket
  region         = "us-east-1"
  key            = "eks/terraform.tfstate"
  dynamodb_table = "Lock-Files"
  encrypt        = true
}
```

### Option B: Create the bucket name from deployment guide

If you prefer to use "my-jenkins-tfstate-6", follow Step 2 above.

---

## Troubleshooting

### Error: "Bucket already exists"
If the bucket name is taken, choose a unique name:
```bash
aws s3api create-bucket \
    --bucket my-jenkins-tfstate-6-$(date +%s) \
    --region us-east-1
```
Then update `backend.tf` with the new bucket name.

### Error: "Access Denied"
1. Check IAM user permissions
2. Verify AWS credentials: `aws sts get-caller-identity`
3. Ensure bucket is in the same region (us-east-1)

### Error: "DynamoDB table not found"
Create the DynamoDB table as shown in Step 2.

---

## Verify Setup

After setup, verify access:

```bash
# List S3 bucket
aws s3 ls s3://my-jenkins-tfstate-6

# Describe DynamoDB table
aws dynamodb describe-table --table-name Lock-Files --region us-east-1

# Test Terraform init
cd /home/ubuntu/E2E-Devops-Project/EKS-Terraform/eks
terraform init
```

If all commands succeed, you're ready to proceed!

