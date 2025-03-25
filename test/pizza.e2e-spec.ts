import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as request from 'supertest';
import { IngredientType, Pizza, PizzaSize } from '@prisma/client';
import { CreatePizzaDto, PizzaIngredientDto } from '../src/pizza/pizza.types';

describe('PizzaController(e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.pizza.deleteMany({});
    await prisma.ingredient.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  /**
   * Curried factory function for testing the CRUD operations of pizza ingredients (i.e. sauces & toppings).
   */
  const checkIngredientCrud = (type: IngredientType) => (name: string) => {
    it(`should insert and delete a new ${type.toLowerCase()} (${name})`, async () => {
      // Check creating a new ingredient
      const { status: createStatus } = await request(app.getHttpServer()).post(
        `/pizza/${type.toLowerCase()}/${name}`,
      );
      expect(createStatus).toEqual(HttpStatus.CREATED);

      // Check looking up newly created ingredient
      const fetchedIngredientsRes = await request(app.getHttpServer()).get(
        `/pizza/${type.toLowerCase()}s`,
      );
      expect(fetchedIngredientsRes.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ name })]),
      );

      // Check deleting an ingredient
      const { status: deleteStatus } = await request(
        app.getHttpServer(),
      ).delete(`/pizza/${type.toLowerCase()}/${name}`);
      expect(deleteStatus).toEqual(HttpStatus.NO_CONTENT);

      // Check deleted sauce is gone
      const refetchedIngredientsRes = await request(app.getHttpServer()).get(
        '/pizza/sauces',
      );
      expect(refetchedIngredientsRes.body).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ name })]),
      );
    });
  };

  const newSauces = ['pesto', 'garlic', 'gravy'];
  const newToppings = ['spinach', 'feta', 'ground beef'];
  newSauces.forEach(checkIngredientCrud(IngredientType.SAUCE));
  newToppings.forEach(checkIngredientCrud(IngredientType.TOPPING));

  it('should create and delete pizzas', async () => {
    // Prepare new pizza DTO
    const saucesRes = await request(app.getHttpServer()).get('/pizza/sauces');
    const toppingsRes = await request(app.getHttpServer()).get(
      '/pizza/toppings',
    );
    const createPizzaDto: CreatePizzaDto = {
      size: PizzaSize.PERSONAL,
      sauces: (saucesRes.body as PizzaIngredientDto[])
        .slice(0, 2)
        .map((s) => ({ ...s, name: s.name })),
      toppings: (toppingsRes.body as PizzaIngredientDto[])
        .slice(0, 2)
        .map((t) => ({ ...t, name: t.name })),
    };

    // Check creating a new pizza
    const createRes = await request(app.getHttpServer())
      .post('/pizza')
      .send(createPizzaDto);
    expect(createRes.status).toEqual(HttpStatus.CREATED);

    // Check deleting that pizza
    const deleteRes = await request(app.getHttpServer()).delete(
      `/pizza/${(createRes.body as Pizza).id}`,
    );
    expect(deleteRes.status).toEqual(HttpStatus.NO_CONTENT);
  });
});
