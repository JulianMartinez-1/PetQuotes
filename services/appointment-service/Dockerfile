FROM node:20-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY services/appointment-service/package.json ./package.json
RUN npm install
COPY services/appointment-service/tsconfig.json ./tsconfig.json
COPY services/appointment-service/prisma ./prisma
RUN npx prisma generate
COPY services/appointment-service/src ./src
COPY libs/contracts ./node_modules/@petquotes/contracts
USER node
EXPOSE 3005
CMD ["npm", "run", "start:dev"]
