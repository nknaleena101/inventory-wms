import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryMovement } from './entities/movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryMovement])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService], // Export to let our background cron job use it later
})
export class InventoryModule {}