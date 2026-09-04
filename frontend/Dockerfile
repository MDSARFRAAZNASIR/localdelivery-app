# Build Stage: Compile React CRA static code
# =========================
# Stage 1: Build React app
# =========================

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Serve Stage: Lightweight Nginx web server
# =========================
# Stage 2: Nginx
# =========================
FROM nginx:alpine

# Copy built assets from builder stage (CRA outputs to /build)
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]