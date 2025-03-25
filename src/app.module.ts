import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PizzaModule } from './pizza/pizza.module';

@Module({
  imports: [PizzaModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
