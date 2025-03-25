FROM node:20

EXPOSE 5555 8080

WORKDIR /app

CMD npm ci \
    # && npm run db:migrate \
    # && npm run db:seed \
    && npm run start:dev