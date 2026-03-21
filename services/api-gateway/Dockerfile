FROM node:20-slim
WORKDIR /app
COPY services/api-gateway/package.json ./package.json
RUN npm install
COPY services/api-gateway/tsconfig.json ./tsconfig.json
COPY services/api-gateway/src ./src
COPY libs/contracts ./node_modules/@petquotes/contracts
USER node
EXPOSE 3001
CMD ["npm", "run", "start:dev"]
