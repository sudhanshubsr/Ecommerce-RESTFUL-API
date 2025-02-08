FROM node:latest  
# Use the latest Node.js image

# Set the working directory

WORKDIR /usr/src/app

# Copy the package.json file to the working directory
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001 3000

CMD ["npm", "start"]
