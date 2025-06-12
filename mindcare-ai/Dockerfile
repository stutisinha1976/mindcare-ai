# Use official Node.js image with Alpine (small size)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY src/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your frontend code
COPY src/ .

# Build the Next.js app
RUN npm run dev

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
