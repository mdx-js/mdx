FROM mhart/alpine-node

WORKDIR /usr/src

COPY package.json .
RUN yarn

COPY . .
RUN npm run docs:build && mv dist /public
