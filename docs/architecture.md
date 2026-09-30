# LocalDelivery DevOps Architecture

## 1. Overview

LocalDelivery is a MERN-based parcel delivery application.

The project uses a complete DevOps workflow covering:

- Git and GitHub
- GitHub Actions
- Docker
- Docker Hub
- VPS infrastructure
- Nginx
- HTTPS
- Prometheus
- Grafana
- Terraform
- Ansible
- k6
- Kubernetes

---

## 2. Application Architecture

```text
                         Users
                           |
                           v
                    HTTPS / Domain
                           |
                           v
                    Nginx / Ingress
                           |
                +----------+----------+
                |                     |
                v                     v
           Frontend Service      Backend Service
                |                     |
                v                     v
          React/Nginx Pods      Backend Pods
                                      |
                              +-------+-------+
                              |               |
                              v               v
                         Backend Pod 1    Backend Pod 2
                              |               |
                              +-------+-------+
                                      |
                                      v
                                MongoDB Atlas
