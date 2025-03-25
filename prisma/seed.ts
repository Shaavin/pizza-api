import { IngredientType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sauceCount = await prisma.ingredient.count({
    where: { deletedAt: null, type: IngredientType.SAUCE },
  });
  if (sauceCount === 0) {
    const newSauces = ['tomato', 'bbq', 'buffalo', 'ranch'];
    await prisma.ingredient.createMany({
      data: newSauces.map((sauce) => ({
        name: sauce,
        type: IngredientType.SAUCE,
      })),
    });
  }

  const toppingCount = await prisma.ingredient.count({
    where: { deletedAt: null, type: IngredientType.TOPPING },
  });
  if (toppingCount === 0) {
    const newToppings = [
      'cheese',
      'pepperoni',
      'mushrooms',
      'onions',
      'pineapple',
      'bell peppers',
      'jalapenos',
      'olives',
      'bacon',
    ];
    await prisma.ingredient.createMany({
      data: newToppings.map((topping) => ({
        name: topping,
        type: IngredientType.TOPPING,
      })),
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
