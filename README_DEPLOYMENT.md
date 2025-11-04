# 🚀 DevOps Project - Simplified & Free Tier Eligible

This project demonstrates a complete CI/CD pipeline for a Three-Tier Web Application (React + Node.js + MongoDB) deployed on AWS EKS.

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete step-by-step deployment guide (⭐ **START HERE**)
- **[QUICK_START.md](QUICK_START.md)** - Condensed quick reference guide
- **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)** - Summary of all simplifications made
- **[START_PROJECT.md](START_PROJECT.md)** - Local development guide

## 🛠️ Tools Used

✅ **AWS & AWS Console** - Infrastructure management  
✅ **EKS (Elastic Kubernetes Service)** - Managed Kubernetes  
✅ **Kubernetes** - Container orchestration  
✅ **Docker** - Containerization  
✅ **Jenkins** - CI/CD automation  
✅ **Terraform** - Infrastructure as Code  
✅ **Ansible** - Configuration management  
✅ **Prometheus** - Metrics collection  
✅ **Grafana** - Visualization dashboards  

## 📋 Quick Overview

### What This Project Does:

1. **Infrastructure Setup** (Terraform)
   - Jenkins server on EC2
   - EKS Kubernetes cluster
   - VPC, subnets, security groups

2. **CI/CD Pipeline** (Jenkins)
   - Automated builds
   - Docker image creation
   - ECR push
   - Kubernetes deployment

3. **Application Deployment** (Kubernetes)
   - Frontend (React)
   - Backend (Node.js)
   - Database (MongoDB)

4. **Monitoring** (Prometheus & Grafana)
   - Metrics collection
   - Visualization dashboards

## 🚀 Getting Started

### Option 1: Full Deployment (Recommended)

Follow the comprehensive guide:
```bash
# Read the deployment guide
cat DEPLOYMENT_GUIDE.md
```

### Option 2: Quick Start

For experienced users:
```bash
# Read the quick start guide
cat QUICK_START.md
```

## 💰 Cost Estimation

**Estimated Daily Costs:**
- EKS Cluster: ~$2.40/day
- Jenkins EC2: ~$0.96/day
- EKS Node: ~$0.48/day
- Load Balancer: ~$0.54/day
- **Total: ~$4.50/day** ✅

**For 4 days: ~$18** (well within $50 budget)

## 📁 Project Structure

```
├── Application-Code/          # Frontend & Backend source code
├── Jenkins-Pipeline-Code/      # Jenkins pipeline scripts
├── Jenkins-Server-TF/          # Terraform for Jenkins server
├── EKS-Terraform/              # Terraform for EKS cluster
├── Kubernetes-Manifests-file/  # K8s deployment manifests
├── DEPLOYMENT_GUIDE.md         # Complete deployment guide
├── QUICK_START.md              # Quick reference
└── README.md                   # Main readme
```

## 🎯 Key Features

- ✅ Simplified CI/CD (removed ArgoCD, SonarQube)
- ✅ Free tier optimized (t3.small instances)
- ✅ Automated deployment pipelines
- ✅ Complete monitoring setup
- ✅ Cost-effective architecture

## ⚠️ Important Notes

1. **Update Repository URLs**: Edit Jenkinsfiles with your GitHub repo
2. **Configure Credentials**: Set up all Jenkins credentials before running pipelines
3. **Cost Monitoring**: Set up AWS billing alerts
4. **Cleanup**: Delete resources when not in use to avoid charges

## 📖 Next Steps

1. Read [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. Set up AWS account and credentials
3. Deploy infrastructure using Terraform
4. Configure Jenkins
5. Run pipelines to deploy application
6. Set up monitoring with Prometheus & Grafana

## 🆘 Need Help?

- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) troubleshooting section
- Review [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md) for what changed
- Verify AWS credentials and permissions
- Check Jenkins logs for pipeline issues

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

**Happy Deploying! 🚀**

