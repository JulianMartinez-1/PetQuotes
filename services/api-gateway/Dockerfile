FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --workspace @petquotes/contracts
USER node
EXPOSE 3001
