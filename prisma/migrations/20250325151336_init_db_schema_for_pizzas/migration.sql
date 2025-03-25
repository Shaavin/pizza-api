-- CreateEnum
CREATE TYPE "PizzaSize" AS ENUM ('PERSONAL', 'SMALL', 'MEDIUM', 'LARGE', 'XLARGE');

-- CreateEnum
CREATE TYPE "IngredientAmount" AS ENUM ('LIGHT', 'REGULAR', 'EXTRA');

-- CreateEnum
CREATE TYPE "IngredientSection" AS ENUM ('LEFT', 'RIGHT', 'WHOLE');

-- CreateEnum
CREATE TYPE "IngredientType" AS ENUM ('SAUCE', 'TOPPING');

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "IngredientType" NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pizza" (
    "id" TEXT NOT NULL,
    "size" "PizzaSize" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Pizza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PizzaIngredient" (
    "id" TEXT NOT NULL,
    "amount" "IngredientAmount" NOT NULL DEFAULT 'REGULAR',
    "section" "IngredientSection" NOT NULL DEFAULT 'WHOLE',
    "pizzaId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,

    CONSTRAINT "PizzaIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_name_key" ON "Ingredient"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PizzaIngredient_pizzaId_ingredientId_section_key" ON "PizzaIngredient"("pizzaId", "ingredientId", "section");

-- AddForeignKey
ALTER TABLE "PizzaIngredient" ADD CONSTRAINT "PizzaIngredient_pizzaId_fkey" FOREIGN KEY ("pizzaId") REFERENCES "Pizza"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PizzaIngredient" ADD CONSTRAINT "PizzaIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
