# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 8060

# Start dev server
CMD ["npm", "run", "dev"]