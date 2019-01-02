FROM node:current-alpine

WORKDIR /app/
COPY package-lock.json package.json tsconfig.json ./
COPY src ./src
COPY migrations ./migrations
COPY bin ./bin
RUN npm install && npm run build
CMD bin/migrate-db && bin/test-leancloud ${TEST_NAME} --appId=${APP_ID} \
    --appKey=${APP_KEY} --continuous --pgUri=${PG_URI}
