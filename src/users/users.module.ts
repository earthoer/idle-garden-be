import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from '../schemas/user.schema';
import { PlantedTree, PlantedTreeSchema } from '../schemas/planted-tree.schema';
import { Location, LocationSchema } from '../schemas/location.schema';
import { Seed, SeedSchema } from '../schemas/seed.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: PlantedTree.name, schema: PlantedTreeSchema },
      { name: Location.name, schema: LocationSchema },
      { name: Seed.name, schema: SeedSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
