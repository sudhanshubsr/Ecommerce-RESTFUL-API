FROM node:latest  
# Use the latest Node.js image

# Set the working directory

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy the package.json file to the working directory
COPY package*.json ./

RUN npm install && npm cache clean --force

COPY . .

EXPOSE 3001 3000

CMD ["npm", "start"]
