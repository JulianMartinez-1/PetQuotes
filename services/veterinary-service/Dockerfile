FROM node:20-alpine
WORKDIR /app
COPY services/veterinary-service/package.json ./package.json
RUN npm install
COPY services/veterinary-service/tsconfig.json ./tsconfig.json
COPY services/veterinary-service/src ./src
EXPOSE 3003
CMD ["npm", "run", "start:dev"]