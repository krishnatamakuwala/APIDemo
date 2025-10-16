FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --include=dev

# Make sure NODE_ENV is not set to production during install
ENV NODE_ENV=development

# Copy all source files
COPY / ./

# Now TypeScript should be available
RUN npx tsc --version
RUN npm run build

EXPOSE 3001

# Fallback command
CMD ["npm", "run", "start"]