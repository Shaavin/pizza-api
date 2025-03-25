import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Ingredient, IngredientType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
