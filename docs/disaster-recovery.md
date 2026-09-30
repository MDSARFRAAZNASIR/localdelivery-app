# LocalDelivery Disaster Recovery

## 1. Purpose

This document describes the failure recovery mechanisms implemented and tested for the LocalDelivery application.

The recovery strategy covers:

- Kubernetes Pod failure
- Replica self-healing
- Rolling update failure
- Kubernetes rollback
- Automated deployment rollback
- Application health validation

---

## 2. Kubernetes Pod Failure

The backend runs with two replicas.

```text
Desired replicas: 2
