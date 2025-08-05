# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy only package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app source code
COPY . .

# Expose the server port (ใช้ .env ได้ หรือ fix 5000)
EXPOSE 8066

# Default command
CMD ["npm", "start"]