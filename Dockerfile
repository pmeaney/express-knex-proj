FROM --platform=linux/amd64 node:16-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ./package*.json .

RUN npm install

# https://github.com/kelektiv/node.bcrypt.js/issues/824
# RUN npm cache clean --force && rm -rf node_modules && npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]