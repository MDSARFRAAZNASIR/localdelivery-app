# LocalDelivery Deployment Guide

## 1. Deployment Overview

LocalDelivery uses a CI/CD-based deployment process.

The overall flow is:

```text
Developer
    |
    v
GitHub
    |
    v
GitHub Actions
    |
    +--> Tests
    |
    +--> Docker Build
    |
    +--> Docker Hub
    |
    +--> Production Deployment
    |
    +--> Validation
    |
    v
Production
