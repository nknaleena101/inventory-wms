import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { SeedModule } from './common/seed.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({ isGlobal: true }),
    // Initialize Database connection
    DatabaseModule,
    // Core Feature modules
    ProductsModule,
    InventoryModule,
    // Seeder Module
    SeedModule,
  ],
})
export class AppModule {}