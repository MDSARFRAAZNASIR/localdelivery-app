# Step 1: Use an official lightweight Node runtime
FROM node:20-alpine

# Step 2: Set working directory inside the container
WORKDIR /app

# Step 3: Copy dependency files first (for efficient caching)
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of your backend source code
COPY . .

# Step 6: Expose your backend port (change 5000 if your server uses a different port)
EXPOSE 5000

# Step 7: Command to run your backend
CMD ["npm", "start"]