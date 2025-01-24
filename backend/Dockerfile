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

# Expose the application port
EXPOSE 5000

# Command to run the backend
CMD ["node", "server.js"]
