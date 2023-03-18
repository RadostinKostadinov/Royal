# Description: Dockerfile for Node.js
FROM node:12

# Create app directory
WORKDIR /app

# Copy package.json libraries
COPY package*.json ./

# Install libraries
RUN npm install

# Copy source code
COPY . .

# Set environment variables
ENV HTTP_PORT=3000
ENV MONGO_URI="mongodb://127.0.0.1:27017/royal"
#ENV MONGO_USER="nodejs"
#ENV MONGO_PASS="fP55naP4iFH6565ShrpyqELGe9MEQGNSnzmiacxG"
ENV TOKEN_KEY="p@JC@Ambo?&NNyR4Y9tJ9PbmrRHjK7H6EeGM@@5q"

# Listen to port
EXPOSE 3000

# Run the app
CMD ["node", "app.js"]