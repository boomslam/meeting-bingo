FROM node:20-alpine

WORKDIR /app

# Alpine uses apk, not apt-get
RUN apk add --no-cache python3 make g++ git

# Copy package files for layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build if needed
RUN npm run build --if-present

# Expose Vite dev server port
EXPOSE 5173

# Default command
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
