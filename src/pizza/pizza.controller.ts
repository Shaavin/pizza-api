import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { PizzaService } from './pizza.service';
import { Ingredient } from '@prisma/client';

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
}
