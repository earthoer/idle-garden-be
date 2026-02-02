import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { User, UserSchema } from '../schemas/user.schema';
import { PlantedTree, PlantedTreeSchema } from '../schemas/planted-tree.schema';
import { Seed, SeedSchema } from '../schemas/seed.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: PlantedTree.name, schema: PlantedTreeSchema },
      { name: Seed.name, schema: SeedSchema },
    ]),
  ],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
