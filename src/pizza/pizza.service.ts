import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Ingredient,
  IngredientSection,
  IngredientType,
  PizzaSize,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PizzaIngredientDto } from './pizza.types';

@Injectable()
export class PizzaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Looks up all available sauces.
   * @returns {Ingredient[]} All available sauces.
   */
  async getSauces(): Promise<Ingredient[]> {
    return await this.prisma.ingredient.findMany({
      where: { deletedAt: null, type: IngredientType.SAUCE },
    });
  }

  /**
   * Looks up all available toppings.
   * @returns {Ingredient[]} All available toppings.
   */
  async getToppings(): Promise<Ingredient[]> {
    return await this.prisma.ingredient.findMany({
      where: { deletedAt: null, type: IngredientType.TOPPING },
    });
  }

  /**
   * Inserts a new sauce choice.
   * @param {string} name The type of sauce to add.
   */
  async addSauce(name: string) {
    await this.throwIfMatchingIngredient(name, IngredientType.SAUCE);
    await this.prisma.ingredient.create({
      data: { name, type: IngredientType.SAUCE },
    });
  }

  /**
   * Inserts a new topping choice.
   * @param {string} name The type of topping to add.
   */
  async addTopping(name: string) {
    await this.throwIfMatchingIngredient(name, IngredientType.TOPPING);
    await this.prisma.ingredient.create({
      data: { name, type: IngredientType.TOPPING },
    });
  }

  async createPizza(
    size: PizzaSize,
    sauces: PizzaIngredientDto[],
    toppings: PizzaIngredientDto[],
  ) {
    this.checkIngredientCoverageOrThrow(sauces);
    this.checkIngredientCoverageOrThrow(toppings);

    const saucesMap = await this.createIngredientMapOrThrow(
      sauces,
      IngredientType.SAUCE,
    );
    const toppingsMap = await this.createIngredientMapOrThrow(
      toppings,
      IngredientType.TOPPING,
    );

    const pizza = await this.prisma.pizza.create({
      data: {
        size,
        pizzaIngredients: {
          createMany: {
            data: [
              ...sauces.map((s) => ({
                // NOTE: Non-null assertion is protected by `this.createIngredientMapOrThrow` call above
                ingredientId: saucesMap.get(s.name)!,
                amount: s.amount,
                section: s.section,
              })),
              ...toppings.map((t) => ({
                // NOTE: Non-null assertion is protected by `this.createIngredientMapOrThrow` call above
                ingredientId: toppingsMap.get(t.name)!,
                amount: t.amount,
                section: t.section,
              })),
            ],
          },
        },
      },
      include: {
        pizzaIngredients: { include: { ingredient: true } },
      },
    });

    return pizza;
  }

  /**
   * Soft deletes a sauce.
   * @param {string} name The name of the sauce.
   */
  async deleteSauce(name: string) {
    await this.throwIfNoIngredient(name, IngredientType.SAUCE);
    await this.prisma.ingredient.update({
      where: { name },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Soft deletes a topping.
   * @param {string} name The name of the topping.
   */
  async deleteTopping(name: string) {
    await this.throwIfNoIngredient(name, IngredientType.TOPPING);
    await this.prisma.ingredient.update({
      where: { name },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Deletes a pizza.
   * @param {string} id The ID of the pizza to delete.
   * @throws If no pizza with the provided ID can be found.
   */
  async deletePizza(id: string) {
    const pizzaToDelete = await this.prisma.pizza.findUnique({
      where: { id },
    });
    if (!pizzaToDelete) {
      throw new HttpException(
        `Could not find pizza with ID ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.prisma.pizza.delete({
      where: { id },
    });
  }

  /**
   * Checks if an ingredient with `name` and `type` already exists. If a match is found,
   * this will throw an error with a 400 status code.
   * @param {string} name The name of the ingredient.
   * @param {IngredientType} type The type of the ingredient.
   * @throws If a matching ingredient is found.
   */
  private async throwIfMatchingIngredient(name: string, type: IngredientType) {
    const match = await this.prisma.ingredient.findUnique({
      where: { name, deletedAt: null, type },
    });
    if (match) {
      throw new HttpException(
        `Failed to add ${type.toLowerCase()} ${name} since it already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Checks if an ingredient exists. If none is found, this will throw an error with a
   * 404 status code.
   * @param {string} name The name of the ingredient.
   * @param {IngredientType} type Type type of the ingredient.
   * @throws If no such ingredient is found.
   */
  private async throwIfNoIngredient(name: string, type: IngredientType) {
    const match = await this.prisma.ingredient.findUnique({
      where: { name, deletedAt: null, type },
    });
    if (!match) {
      throw new HttpException(
        `Could not find ${type.toLowerCase()} ${name}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Checks if a list of pizza ingredients fully covers the pizza and throws if not.
   * @param {PizzaIngredientDto[]} ingredients The ingredients to check coverage for.
   * @throws If the ingredients do not fully cover the pizza.
   */
  private checkIngredientCoverageOrThrow(ingredients: PizzaIngredientDto[]) {
    const somIngredientCoversWholePizza = ingredients.some(
      (i) => i.section === IngredientSection.WHOLE,
    );
    const someIngredientCoversLeft = ingredients.some(
      (i) => i.section === IngredientSection.LEFT,
    );
    const someIngredientCoversRight = ingredients.some(
      (i) => i.section === IngredientSection.RIGHT,
    );

    // TODO: Do we want to allow multiple sauces on same part of pizza?
    if (
      !somIngredientCoversWholePizza &&
      !(someIngredientCoversLeft && someIngredientCoversRight)
    ) {
      throw new HttpException(
        'Pizza sauces and toppings must cover entire pizza',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Ensures all ingredients exist, and if so, returns a map from that ingredient's name to its ID.
   * @param {PizzaIngredientDto[]} ingredients The ingredients to match and create an ID map for.
   * @param {IngredientType} ingredientType The type of the ingredients.
   * @returns {Promise<Map<string, strin>>} A map from ingredient names to their IDs.
   * @throws If an ingredient does not exist of the provided ingredient type.
   */
  private async createIngredientMapOrThrow(
    ingredients: PizzaIngredientDto[],
    ingredientType: IngredientType,
  ): Promise<Map<string, string>> {
    const ingredientsMap = new Map<string, string>();
    for (const ingredient of ingredients) {
      const match = await this.prisma.ingredient.findUnique({
        where: { name: ingredient.name, deletedAt: null, type: ingredientType },
      });
      if (!match) {
        throw new HttpException(
          `Could not find ${ingredientType.toLowerCase()} named ${ingredient.name}`,
          HttpStatus.NOT_FOUND,
        );
      }
      ingredientsMap.set(ingredient.name, match.id);
    }
    return ingredientsMap;
  }
}
