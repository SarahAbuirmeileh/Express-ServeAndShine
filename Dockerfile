FROM node:20-alpine

WORKDIR /user/app
COPY package.json package-lock.json ./

RUN npm ci

RUN apk add curl

ADD . .
RUN npm run build

HEALTHCHECK --interval=10s --timeout=3s \
    CMD curl -f http://localhost/ || exit 1

CMD node --loader ts-node/esm ./dist/app.js