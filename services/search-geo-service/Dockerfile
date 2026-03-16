FROM node:20-alpine
WORKDIR /app
COPY services/search-geo-service/package.json ./package.json
RUN npm install
COPY services/search-geo-service/tsconfig.json ./tsconfig.json
COPY services/search-geo-service/src ./src
EXPOSE 3007
CMD ["npm", "run", "start:dev"]