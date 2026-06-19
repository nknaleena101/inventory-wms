import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ReplenishmentService } from './replenishment.service';
import { ReplenishmentListener } from './replenishment.listener';
import { PurchaseOrder } from './entities/purchase-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseOrder]),
    ScheduleModule.forRoot(),       // Initializes NestJS Background Cron System
    EventEmitterModule.forRoot(),   // Initializes NestJS Decoupled App Event Engine
  ],
  providers: [ReplenishmentService]
})
export class ReplenishmentModule {}
