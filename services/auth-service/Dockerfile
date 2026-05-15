FROM node:20-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY . .
COPY services/auth-service/generated /app/services/auth-service/generated
RUN npm install
RUN npm run build --workspace @petquotes/contracts
EXPOSE 3002
