# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Railway uses PORT env variable - default to 8080
ENV PORT=8080

# Expose the port
EXPOSE 8080

# nginx docker image automatically processes templates in /etc/nginx/templates/
CMD ["nginx", "-g", "daemon off;"]
