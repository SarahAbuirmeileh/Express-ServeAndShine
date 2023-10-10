FROM node:18-alpine

WORKDIR /user/app
COPY package.json package-lock.json ./

RUN npm ci

ADD . .
RUN npm run build

CMD node ./dist/app.js