import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PizzaController } from './pizza.controller';
import { PizzaService } from './pizza.service';

@Module({
  imports: [PrismaModule],
  controllers: [PizzaController],
  providers: [PizzaService],
  exports: [PizzaService],
})
export class PizzaModule {}
