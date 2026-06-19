FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copy package.json and package-lock.json if they exist
COPY package*.json ./

# Install dependencies
RUN if [ -f package.json ]; then npm install; fi

# Copy all backend source code
COPY . .

# Expose the API port
EXPOSE 5011

# Start the development server
CMD ["npm", "run", "dev"]
