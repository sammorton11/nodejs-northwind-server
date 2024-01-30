# Use an official Node.js runtime as a parent image
FROM node:14.15.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./


# Install app dependencies
RUN npm install

# Bundle your app source
COPY . .

# Copy the SQLite database file into the container
COPY northwind.db /usr/src/app/northwind.db

# Expose the port your app runs on
EXPOSE 3000

# Command to run your application
CMD ["node", "index.js"]

