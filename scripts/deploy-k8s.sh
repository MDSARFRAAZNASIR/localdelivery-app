#!/bin/bash

set -euo pipefail

IMAGE_TAG="${1:-}"

if [ -z "$IMAGE_TAG" ]; then
    echo "ERROR: IMAGE_TAG is required"
    echo "Usage: $0 <image-tag>"
    exit 1
fi

BACKEND_IMAGE="mdsarfraaznasir/localdelivery-backend:${IMAGE_TAG}"
FRONTEND_IMAGE="mdsarfraaznasir/localdelivery-frontend:${IMAGE_TAG}"

NAMESPACE="localdelivery"

echo "======================================"
echo "Kubernetes Deployment"
echo "======================================"
echo "Image tag: $IMAGE_TAG"
echo "Backend:   $BACKEND_IMAGE"
echo "Frontend:  $FRONTEND_IMAGE"
echo "Namespace: $NAMESPACE"
echo "======================================"

echo ""
echo "Updating backend image..."
kubectl set image deployment/localdelivery-backend \
    backend="$BACKEND_IMAGE" \
    -n "$NAMESPACE"

echo ""
echo "Updating frontend image..."
kubectl set image deployment/localdelivery-frontend \
    frontend="$FRONTEND_IMAGE" \
    -n "$NAMESPACE"

echo ""
echo "Waiting for backend rollout..."
kubectl rollout status deployment/localdelivery-backend \
    -n "$NAMESPACE" \
    --timeout=180s

echo ""
echo "Waiting for frontend rollout..."
kubectl rollout status deployment/localdelivery-frontend \
    -n "$NAMESPACE" \
    --timeout=180s

echo ""
echo "Checking deployments..."
kubectl get deployments -n "$NAMESPACE"

echo ""
echo "Checking Pods..."
kubectl get pods -n "$NAMESPACE"

echo ""
echo "Checking backend health..."

BACKEND_POD=$(kubectl get pods \
    -n "$NAMESPACE" \
    -l app=localdelivery-backend \
    -o jsonpath='{.items[0].metadata.name}')

kubectl exec "$BACKEND_POD" \
    -n "$NAMESPACE" \
    -- wget -qO- http://localhost:5000/health

echo ""
echo "Backend health check passed."

echo ""
echo "======================================"
echo "KUBERNETES DEPLOYMENT SUCCESSFUL"
echo "======================================"
