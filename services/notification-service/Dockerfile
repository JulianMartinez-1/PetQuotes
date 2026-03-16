FROM node:20-alpine
WORKDIR /app
COPY services/notification-service/package.json ./package.json
RUN npm install
COPY services/notification-service/tsconfig.json ./tsconfig.json
COPY services/notification-service/src ./src
EXPOSE 3008
CMD ["npm", "run", "start:dev"]