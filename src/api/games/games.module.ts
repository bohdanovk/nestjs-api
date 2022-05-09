import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { Game, GameSchema } from './schemas/game.schema';
import { PublishersModule } from '../publishers/publishers.module';

@Module({
  providers: [GamesService],
  controllers: [GamesController],
  imports: [
    PublishersModule,
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
  ],
})
export class GamesModule {}
