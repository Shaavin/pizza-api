import { IngredientAmount, IngredientSection, PizzaSize } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PizzaIngredientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(IngredientAmount)
  @IsOptional()
  amount: IngredientAmount = IngredientAmount.REGULAR;

  @IsEnum(IngredientSection)
  @IsOptional()
  section: IngredientSection = IngredientSection.WHOLE;
}

export class CreatePizzaDto {
  @IsEnum(PizzaSize)
  @IsNotEmpty()
  size: PizzaSize;

  @IsArray()
  @ValidateNested({ each: true })
  sauces: PizzaIngredientDto[];

  @IsArray()
  @ValidateNested({ each: true })
  toppings: PizzaIngredientDto[];
}
