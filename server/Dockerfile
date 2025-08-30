# Base image
FROM node:18

# ติดตั้ง FFmpeg เข้าไปใน container
RUN apt-get update && apt-get install -y ffmpeg

# Set working directory
WORKDIR /app

# Copy only package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app source code
COPY . .

# Expose the server port (คุณ fix หรือใช้ env ก็ได้)
EXPOSE 8066

# Default command
CMD ["npm", "run", "dev"]
