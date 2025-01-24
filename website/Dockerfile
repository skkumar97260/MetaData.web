# Use an official Node.js image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code
COPY . .

# Build the React app
RUN npm run build

# Use a lightweight server for static files
RUN npm install -g serve

# Expose the application port
EXPOSE 3000

# Command to serve the frontend
CMD ["serve", "-s", "build", "-l", "3000"]
    