FROM node:20-alpine
WORKDIR /app
COPY services/staff-schedule-service/package.json ./package.json
RUN npm install
COPY services/staff-schedule-service/tsconfig.json ./tsconfig.json
COPY services/staff-schedule-service/src ./src
EXPOSE 3006
CMD ["npm", "run", "start:dev"]