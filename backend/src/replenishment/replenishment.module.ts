import { Module } from '@nestjs/common';
import { ReplenishmentService } from './replenishment.service';

@Module({
  providers: [ReplenishmentService]
})
export class ReplenishmentModule {}
