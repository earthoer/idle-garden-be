import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedsController } from './seeds.controller';
import { SeedsService } from './seeds.service';
import { Seed, SeedSchema } from '../schemas/seed.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Seed.name, schema: SeedSchema }]),
  ],
  controllers: [SeedsController],
  providers: [SeedsService],
  exports: [SeedsService],
})
export class SeedsModule {}
