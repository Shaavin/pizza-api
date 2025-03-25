import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PizzaService } from './pizza.service';
import {
  Ingredient,
  IngredientAmount,
  IngredientSection,
} from '@prisma/client';
import { CreatePizzaDto, PizzaIngredientDto } from './pizza.types';

@Controller('pizza')
export class PizzaController {
  constructor(private readonly pizzaService: PizzaService) {}

  @Get('sauces')
  async getSauces(): Promise<Ingredient[]> {
    return await this.pizzaService.getSauces();
  }

  @Get('toppings')
  async getToppings(): Promise<Ingredient[]> {
    return await this.pizzaService.getToppings();
  }

  @Post('sauce/:name')
  @HttpCode(HttpStatus.CREATED)
  async addSauce(@Param('name') name: string) {
    await this.pizzaService.addSauce(name.toLowerCase());
  }

  @Post('topping/:name')
  @HttpCode(HttpStatus.CREATED)
  async addTopping(@Param('name') name: string) {
    await this.pizzaService.addTopping(name.toLowerCase());
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createPizza(@Body() createPizzaDto: CreatePizzaDto) {
    return await this.pizzaService.createPizza(
      createPizzaDto.size,
      createPizzaDto.sauces.map(formatNewPizzaIngredientWithDefaults),
      createPizzaDto.toppings.map(formatNewPizzaIngredientWithDefaults),
    );
  }

  @Delete('sauce/:name')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSauce(@Param('name') name: string) {
    await this.pizzaService.deleteSauce(name.toLowerCase());
  }

  @Delete('topping/:name')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTopping(@Param('name') name: string) {
    await this.pizzaService.deleteTopping(name.toLowerCase());
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePizza(@Param('id') id: string) {
    await this.pizzaService.deletePizza(id);
  }
}

/**
 * Performs some name formatting & supplies defaults to pizza ingredients.
 * @param {Partial<PizzaIngredientDto> & { name: string }} ingredient The
 *  ingredient to format.
 * @returns {PizzaIngredientDto} The formatted pizza ingredient.
 */
function formatNewPizzaIngredientWithDefaults(
  ingredient: Partial<PizzaIngredientDto> & { name: string },
): PizzaIngredientDto {
  return {
    ...ingredient,
    name: ingredient.name.toLowerCase(),
    amount: ingredient.amount ? ingredient.amount : IngredientAmount.REGULAR,
    section: ingredient.section ? ingredient.section : IngredientSection.WHOLE,
  };
}
