# Three-Tier Web Application Deployment on AWS EKS using AWS, EKS, Kubernetes, Docker, Jenkins, Terraform, Ansible, Prometheus, and Grafana
[![LinkedIn](https://img.shields.io/badge/Connect%20with%20me%20on-LinkedIn-blue.svg)](https://www.linkedin.com/in/aman-devops/)
[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/invite/jdzF8kTtw2)
[![Medium](https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/@amanpathakdevops)
[![GitHub](https://img.shields.io/github/stars/AmanPathak-DevOps.svg?style=social)](https://github.com/AmanPathak-DevOps)
[![AWS](https://img.shields.io/badge/AWS-%F0%9F%9B%A1-orange)](https://aws.amazon.com)
[![Terraform](https://img.shields.io/badge/Terraform-%E2%9C%A8-lightgrey)](https://www.terraform.io)

![Three-Tier Banner](assets/Three-Tier.gif)

Welcome to the Three-Tier Web Application Deployment project! 🚀

This repository hosts the implementation of a Three-Tier Web App using ReactJS, NodeJS, and MongoDB, deployed on AWS EKS. The project covers a wide range of tools and practices for a robust and scalable DevOps setup.

## Table of Contents
- [Application Code](#application-code)
- [Jenkins Pipeline Code](#jenkins-pipeline-code)
- [Jenkins Server Terraform](#jenkins-server-terraform)
- [Kubernetes Manifests Files](#kubernetes-manifests-files)
- [Project Details](#project-details)

## Application Code
The `Application-Code` directory contains the source code for the Three-Tier Web Application. Dive into this directory to explore the frontend and backend implementations.

## Jenkins Pipeline Code
In the `Jenkins-Pipeline-Code` directory, you'll find Jenkins pipeline scripts. These scripts automate the CI/CD process, ensuring smooth integration and deployment of your application.

## Jenkins Server Terraform
Explore the `Jenkins-Server-TF` directory to find Terraform scripts for setting up the Jenkins Server on AWS. These scripts simplify the infrastructure provisioning process.

## Kubernetes Manifests Files
The `Kubernetes-Manifests-Files` directory holds Kubernetes manifests for deploying your application on AWS EKS. Understand and customize these files to suit your project needs.

## Project Details
🛠️ **Tools Explored:**
- **AWS & AWS Console**: Infrastructure management and monitoring
- **EKS (Elastic Kubernetes Service)**: Managed Kubernetes cluster
- **Kubernetes**: Container orchestration
- **Docker**: Containerization
- **Jenkins**: CI/CD pipeline automation
- **Terraform**: Infrastructure as Code (IaC)
- **Ansible**: Configuration management
- **Prometheus**: Metrics collection and monitoring
- **Grafana**: Visualization and dashboards

🚢 **High-Level Overview:**
- IAM User setup & Terraform magic on AWS
- Jenkins deployment with AWS integration
- EKS Cluster creation with optimized free-tier configuration
- Private ECR repositories for secure image management
- Helm charts for Prometheus & Grafana monitoring setup
- Automated CI/CD pipelines for frontend and backend

📈 **This project demonstrates a complete DevOps pipeline from code to deployment, including infrastructure provisioning, CI/CD automation, containerization, and monitoring.**

## Getting Started
For detailed step-by-step deployment instructions, please refer to **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** which covers:
- AWS account setup and prerequisites
- Terraform infrastructure provisioning
- Jenkins server setup
- EKS cluster creation
- Application deployment
- Prometheus & Grafana monitoring setup

## Contributing
We welcome contributions! If you have ideas for enhancements or find any issues, please open a pull request or file an issue.

## License
This project is licensed under the [MIT License](LICENSE).

Happy Coding! 🚀
