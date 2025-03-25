# Pizza API

This project is built with:

- [Nest.js](https://docs.nestjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [Docker](https://docs.docker.com/)
- [Jest](https://jestjs.io/)

## Getting Started

Make sure you have a `.env` file at the root of your project with the following line:

```sh
DATABASE_URL="postgresql://username:password@postgres:5432/pizza_db?schema=public"
```

This project is virtualized with Docker, using a Nest.js API and a Postgres database. To run the container for local development, run the command:

```sh
docker-compose up
```

The API will be hosted at <http://localhost:8080/>, and the container also provides access to Prisma Studio (an in-browser, database visualization tool) at <http://localhost:5555/>.

For rapid e2e testing, I have provided a quick e2e bash script located at `test/test-e2e.sh`. You may need to `cd` into `/test` give this script executable permissions, like so:

```sh
cd test
chmod +x test-e2e.sh
./test-e2e.sh
```

This will run all the e2e tests located within the `/test` subdirectory.

## Quick Notes About the Project

The API supports some customization options for pizza ingredients, such as:

- Amount: `LIGHT`, `REGULAR`, or `EXTRA`. The amount defaults to `REGULAR`.
- Section: Which area of the pizza the ingredient will go (`LEFT`, `RIGHT`, or `WHOLE`). The section defaults to `WHOLE`.
- Ingredients are maintained with a table for easy insertion, deletion, and retrieval via endpoints available in `/src/pizza/pizza.controller.ts`.
