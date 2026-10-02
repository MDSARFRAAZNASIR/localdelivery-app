# LocalDelivery DevOps Journey

## 1. Overview

This document records the DevOps implementation journey for the LocalDelivery application.

The project progressed from a basic MERN application toward an automated, containerized, monitored, infrastructure-as-code, Kubernetes-based deployment workflow.

---

## 2. Starting Application

The application is based on the MERN stack:

- MongoDB
- Express.js
- React.js
- Node.js

The application contains frontend and backend components and uses external services such as MongoDB Atlas and application authentication/payment services.

---

## 3. Git and GitHub

The project uses Git for source control and GitHub for repository hosting.

Git provides:

- Version control
- Branching
- Commit history
- Collaboration
- Recovery through previous commits

DevOps work was organized on the:

```text
devops/dockerization
