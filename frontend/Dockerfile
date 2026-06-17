FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json if they exist
COPY package*.json ./

# Install dependencies
RUN if [ -f package.json ]; then npm install; fi

# Copy all frontend source code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Ensure Vite listens on all interfaces so it's accessible from the host
ENV HOST=0.0.0.0

# Start the Vite development server
CMD ["npm", "run", "dev"]
