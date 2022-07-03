FROM node:12.2.0-alpine

# Create App Directory
# WORKDIR /usr/src/app
WORKDIR /usr/src/app

# Install Dependencies
COPY ./package*.json ./

RUN npm install --silent

# Copy app source code
COPY . .

# Exports
EXPOSE 5000

# ENV MONGODB_USERNAME=admin
# ENV MONGODB_PASSWORD=admin

CMD ["npm", "run", "server"]
