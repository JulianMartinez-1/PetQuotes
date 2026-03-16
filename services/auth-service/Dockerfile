FROM node:20-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY services/auth-service/package.json ./package.json
RUN npm install
COPY services/auth-service/tsconfig.json ./tsconfig.json
COPY services/auth-service/prisma ./prisma
RUN npx prisma generate
COPY services/auth-service/src ./src
USER node
EXPOSE 3002
CMD ["npm", "run", "start:dev"]
