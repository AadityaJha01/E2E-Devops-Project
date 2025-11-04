# 📝 Placeholders & Customizable Values Reference

This document lists all placeholders and customizable values in the project that you can change to customize it for your use case.

---

## 🌐 **AWS & Infrastructure Placeholders**

### **Kubernetes Manifests** (`Kubernetes-Manifests-file/`)

#### **Ingress Configuration** (`ingress.yaml`)
- **Line 14**: `host: amanpathakdevops.study`
  - **Change to**: Your domain name or remove if using auto-generated ALB DNS
  - **Example**: `yourdomain.com` or `app.yourcompany.com`

#### **Backend Deployment** (`Backend/deployment.yaml`)
- **Line 28**: `image: 407622020962.dkr.ecr.us-east-1.amazonaws.com/backend:1`
  - **Format**: `<AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/<REPO_NAME>:<TAG>`
  - **Change to**: Your AWS account ID, region, and ECR repository name
  - **Example**: `123456789012.dkr.ecr.us-west-2.amazonaws.com/my-backend:1`

- **Line 5**: `namespace: three-tier`
  - **Change to**: Your preferred Kubernetes namespace
  - **Example**: `production`, `staging`, `dev`

- **Line 8**: `env: demo`
  - **Change to**: Your environment label
  - **Example**: `production`, `staging`, `development`

- **Line 10**: `replicas: 2`
  - **Change to**: Number of backend replicas you want

- **Line 32**: `mongodb://mongodb-svc:27017/todo?directConnection=true`
  - **Change `todo`**: Database name
  - **Example**: `mongodb://mongodb-svc:27017/mytasks?directConnection=true`

#### **Frontend Deployment** (`Frontend/deployment.yaml`)
- **Line 28**: `image: 407622020962.dkr.ecr.us-east-1.amazonaws.com/frontend:3`
  - **Change to**: Your frontend ECR image URL
  - **Example**: `123456789012.dkr.ecr.us-west-2.amazonaws.com/my-frontend:3`

- **Line 32**: `value: "http://amanpathakdevops.study/api/tasks"`
  - **Change to**: Your backend API URL
  - **Example**: `http://yourdomain.com/api/tasks` or `https://api.yourdomain.com/api/tasks`

- **Line 5**: `namespace: three-tier` (same as backend)
- **Line 10**: `replicas: 1` (number of frontend replicas)

#### **Database Configuration** (`Database/deployment.yaml`)
- **Line 18**: `image: mongo:4.4.6`
  - **Change to**: MongoDB version you want
  - **Example**: `mongo:5.0`, `mongo:6.0`

- **Line 23**: `- "0.1"` (WiredTiger cache size)
  - **Change to**: Memory allocation in GB
  - **Example**: `- "0.5"` for 500MB

#### **Database Secrets** (`Database/secrets.yaml`)
- **Line 8**: `password: cGFzc3dvcmQxMjM=` (base64 encoded)
  - **Decoded**: `password123`
  - **Change to**: Your MongoDB password (base64 encoded)
  - **To encode**: `echo -n "yourpassword" | base64`

- **Line 9**: `username: YWRtaW4=` (base64 encoded)
  - **Decoded**: `admin`
  - **Change to**: Your MongoDB username (base64 encoded)

- **Line 4**: `namespace: three-tier` (must match other deployments)

---

## 🔄 **Jenkins Pipeline Placeholders**

### **Backend Pipeline** (`Jenkins-Pipeline-Code/Jenkinsfile-Backend`)

- **Line 9**: `AWS_ACCOUNT_ID = credentials('ACCOUNT_ID')`
  - **Jenkins Credential ID**: Change `ACCOUNT_ID` to your credential name

- **Line 10**: `AWS_ECR_REPO_NAME = credentials('ECR_REPO2')`
  - **Jenkins Credential ID**: Change `ECR_REPO2` to your credential name
  - **Value should be**: Your ECR repository name (e.g., `backend`, `my-backend`)

- **Line 11**: `AWS_DEFAULT_REGION = 'us-east-1'`
  - **Change to**: Your AWS region
  - **Example**: `us-west-2`, `eu-west-1`, `ap-south-1`

- **Line 22, 85**: `url: 'https://github.com/AmanPathak-DevOps/End-to-End-Kubernetes-Three-Tier-DevSecOps-Project.git'`
  - **Change to**: Your GitHub repository URL
  - **Example**: `https://github.com/yourusername/your-repo.git`

- **Line 22, 85**: `credentialsId: 'GITHUB'`
  - **Change to**: Your Jenkins GitHub credentials ID

- **Line 28**: `withSonarQubeEnv('sonar-server')`
  - **Change `sonar-server`**: Your SonarQube server configuration name

- **Line 30-31**: `-Dsonar.projectName=three-tier-backend` and `-Dsonar.projectKey=three-tier-backend`
  - **Change to**: Your SonarQube project names

- **Line 39**: `credentialsId: 'sonar-token'`
  - **Change to**: Your SonarQube token credential ID

- **Line 46**: `odcInstallation: 'DP-Check'`
  - **Change to**: Your OWASP Dependency-Check installation name

- **Line 90-91**: 
  - `GIT_REPO_NAME = "End-to-End-Kubernetes-Three-Tier-DevSecOps-Project"`
  - `GIT_USER_NAME = "AmanPathak-DevOps"`
  - **Change to**: Your repository name and GitHub username

- **Line 97**: `git config user.email "aman07pathak@gmail.com"`
  - **Change to**: Your Git email

- **Line 98**: `git config user.name "AmanPathak-DevOps"`
  - **Change to**: Your Git username

- **Line 95**: `credentialsId: 'github'`
  - **Change to**: Your GitHub token credential ID

- **Line 106**: `HEAD:master`
  - **Change `master`**: Your default branch name
  - **Example**: `HEAD:main`, `HEAD:develop`

### **Frontend Pipeline** (`Jenkins-Pipeline-Code/Jenkinsfile-Frontend`)

- **Line 10**: `AWS_ECR_REPO_NAME = credentials('ECR_REPO1')`
  - **Change to**: Your frontend ECR repository credential ID
  - **Note**: Should be different from backend (e.g., `frontend`, `my-frontend`)

- **Line 30-31**: `-Dsonar.projectName=three-tier-frontend` and `-Dsonar.projectKey=three-tier-frontend`
  - **Change to**: Your frontend SonarQube project names

- **All other placeholders**: Same as backend pipeline (GitHub URL, region, etc.)

---

## 🏗️ **Terraform Placeholders**

### **Terraform Variables** (`Jenkins-Server-TF/variables.tfvars`)

- **Line 1**: `vpc-name = "Jenkins-vpc"`
  - **Change to**: Your VPC name

- **Line 2**: `igw-name = "Jenkins-igw"`
  - **Change to**: Your Internet Gateway name

- **Line 3**: `subnet-name = "Jenkins-subnet"`
  - **Change to**: Your subnet name

- **Line 4**: `rt-name = "Jenkins-route-table"`
  - **Change to**: Your route table name

- **Line 5**: `sg-name = "Jenkins-sg"`
  - **Change to**: Your security group name

- **Line 6**: `instance-name = "Jenkins-server"`
  - **Change to**: Your EC2 instance name

- **Line 7**: `key-name = "Aman-Pathak"`
  - **Change to**: Your AWS Key Pair name

- **Line 8**: `iam-role = "Jenkins-iam-role"`
  - **Change to**: Your IAM role name

---

## 🎨 **Application UI/UX Placeholders**

### **Frontend Application** (`Application-Code/frontend/src/App.js`)

- **Line 46**: `const categories = ["general", "work", "personal", "shopping", "health", "finance"];`
  - **Change to**: Your task categories
  - **Example**: `["urgent", "meetings", "projects", "errands"]`

- **Line 53**: `✨ Advanced Task Manager`
  - **Change to**: Your application title
  - **Example**: `My Task List`, `Project Planner`, `Todo App`

- **Line 90**: `📊 Task Statistics`
  - **Change to**: Your statistics section title
  - **Example**: `Dashboard`, `Overview`, `Analytics`

### **Frontend Styling** (`Application-Code/frontend/src/App.css`)

#### **Color Schemes**

- **Line 13**: `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`
  - **Body background gradient**: Change colors to your brand colors
  - **Example**: `linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)`

- **Line 24**: `background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);`
  - **Header background gradient**: Change to your header color
  - **Example**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

- **Line 83**: `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`
  - **Total stat box gradient**

- **Line 88**: `background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);`
  - **Pending stat box gradient**

- **Line 93**: `background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);`
  - **Completed stat box gradient**

- **Line 98**: `background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);`
  - **Overdue stat box gradient**

#### **Priority Colors** (`Application-Code/frontend/src/Tasks.js`)

- **Line ~150**: Priority color mapping:
  - `high: "#f44336"` (Red)
  - `medium: "#ff9800"` (Orange)
  - `low: "#4caf50"` (Green)
  - **Change to**: Your preferred priority colors

#### **Layout Settings**

- **Line 59**: `max-width: 1200px;`
  - **Change to**: Your preferred maximum content width
  - **Example**: `1400px`, `960px`

- **Line 31**: `max-width: 1200px;` (header content)
  - **Should match**: Main content max-width

---

## 🔧 **Backend Configuration**

### **Backend Model** (`Application-Code/backend/models/task.js`)

- **Line 15**: `enum: ["low", "medium", "high"]`
  - **Change to**: Your priority levels
  - **Example**: `["critical", "high", "normal", "low"]`

- **Line 24**: `default: "general"`
  - **Change to**: Default category name (must match one in frontend categories array)

### **Backend Routes** (`Application-Code/backend/routes/tasks.js`)

- **Line 24**: `sortBy = "createdAt"`
  - **Change to**: Default sort field
  - **Options**: `createdAt`, `dueDate`, `priority`, `task`

- **Line 25**: `sortOrder = "desc"`
  - **Change to**: Default sort order
  - **Options**: `"asc"` or `"desc"`

### **Backend Server** (`Application-Code/backend/index.js`)

- **Line 45**: `const port = process.env.PORT || 3500;`
  - **Change `3500`**: Default port if PORT env var not set
  - **Note**: Must match Kubernetes service port

---

## 🐳 **Docker Configuration**

### **Backend Dockerfile** (`Application-Code/backend/Dockerfile`)

- **Line 1**: `FROM node:14`
  - **Change to**: Node.js version you want
  - **Example**: `node:16`, `node:18`, `node:20`

### **Frontend Dockerfile** (`Application-Code/frontend/Dockerfile`)

- **Line 1**: `FROM node:14`
  - **Change to**: Node.js version (should match backend or newer)

---

## 📦 **Package Configuration**

### **Frontend Package** (`Application-Code/frontend/package.json`)

- **Line 2**: `"name": "client"`
  - **Change to**: Your frontend package name

- **Line 3**: `"version": "0.1.0"`
  - **Change to**: Your version number

### **Backend Package** (`Application-Code/backend/package.json`)

- **Line 2**: `"name": "server"`
  - **Change to**: Your backend package name

- **Line 3**: `"version": "1.0.0"`
  - **Change to**: Your version number

---

## 🔐 **Environment Variables**

### **Backend Environment Variables** (Set in Kubernetes deployment)

- `MONGO_CONN_STR`: MongoDB connection string
- `MONGO_USERNAME`: MongoDB username (from secrets)
- `MONGO_PASSWORD`: MongoDB password (from secrets)
- `PORT`: Server port (default: 3500)
- `USE_DB_AUTH`: Enable MongoDB authentication (true/false)

### **Frontend Environment Variables** (Set in Kubernetes deployment)

- `REACT_APP_BACKEND_URL`: Backend API URL
  - **Current**: `http://amanpathakdevops.study/api/tasks`
  - **Change to**: Your backend URL

---

## 📝 **Summary Checklist**

When customizing the project, update these in order:

1. ✅ **AWS Account Details**: ECR repository URLs, account IDs, regions
2. ✅ **Domain/Hostname**: Ingress host and frontend backend URL
3. ✅ **GitHub Repository**: URLs in Jenkins pipelines
4. ✅ **Kubernetes Namespace**: All manifest files
5. ✅ **Jenkins Credentials**: Credential IDs in pipelines
6. ✅ **Database Secrets**: Username and password (base64 encoded)
7. ✅ **Terraform Variables**: Resource names in `variables.tfvars`
8. ✅ **Application Branding**: App title, colors, categories
9. ✅ **Node.js Versions**: In Dockerfiles
10. ✅ **Package Names & Versions**: In package.json files

---

## 🚀 **Quick Customization Guide**

### **For a New Project:**

1. Replace all occurrences of:
   - `407622020962` → Your AWS Account ID
   - `amanpathakdevops.study` → Your domain
   - `AmanPathak-DevOps` → Your GitHub username
   - `three-tier` → Your namespace
   - `End-to-End-Kubernetes-Three-Tier-DevSecOps-Project` → Your repo name

2. Update Jenkins credentials IDs in pipelines
3. Update Terraform variable values
4. Customize UI colors and categories
5. Update database connection string

---

**Note**: Always test changes in a development environment before deploying to production!

