import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReplenishmentModule } from './replenishment/replenishment.module';

@Module({
  imports: [ProductsModule, InventoryModule, ReplenishmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
