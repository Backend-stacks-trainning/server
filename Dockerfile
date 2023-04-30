# base image
FROM node:16-alpine

# set working directory
WORKDIR /app

# copy package.json and package-lock.json
COPY package*.json ./

# install dependencies
RUN npm install

# copy app source code
COPY . .

# expose port 3000
EXPOSE 3000

# start the app
CMD ["npm", "run", "start:prod"]