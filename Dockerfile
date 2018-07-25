FROM mhart/alpine-node

WORKDIR /usr/src

COPY package.json .
RUN npm i --ignore-scripts

COPY . .
RUN npm run docs:build && mv dist /public
