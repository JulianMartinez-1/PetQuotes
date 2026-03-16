FROM node:20-alpine
WORKDIR /app
COPY services/catalog-service/package.json ./package.json
RUN npm install
COPY services/catalog-service/tsconfig.json ./tsconfig.json
COPY services/catalog-service/src ./src
EXPOSE 3004
CMD ["npm", "run", "start:dev"]