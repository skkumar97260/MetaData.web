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

# Build the React app and pass the environment variables at build time
ARG REACT_APP_GOOGLE_API_KEY
RUN REACT_APP_GOOGLE_API_KEY=$REACT_APP_GOOGLE_API_KEY npm run build

# Install serve for serving the build
RUN npm install -g serve

# Expose the application port
EXPOSE 3000

# Command to serve the frontend
CMD ["serve", "-s", "build", "-l", "3000"]
