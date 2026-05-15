FROM node:20-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY . .
RUN npm install
RUN npm run build --workspace @petquotes/contracts
USER node
EXPOSE 3005
CMD ["npm", "run", "start:dev", "--workspace", "appointment-service"]
