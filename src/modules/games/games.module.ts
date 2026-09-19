import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PublishersModule } from '../publishers/index.js';
import { CreateGameUseCase } from './application/use-cases/create-game.use-case.js';
import { DeleteGameUseCase } from './application/use-cases/delete-game.use-case.js';
import { DetachPublisherFromGamesUseCase } from './application/use-cases/detach-publisher-from-games.use-case.js';
import { GetGameUseCase } from './application/use-cases/get-game.use-case.js';
import { GetGamePublisherUseCase } from './application/use-cases/get-game-publisher.use-case.js';
import { ListGamesUseCase } from './application/use-cases/list-games.use-case.js';
import { RunCatalogMaintenanceUseCase } from './application/use-cases/run-catalog-maintenance.use-case.js';
import { UpdateGameUseCase } from './application/use-cases/update-game.use-case.js';
import { CatalogLifecyclePolicy } from './domain/catalog-lifecycle-policy.js';
import { GAME_REPOSITORY } from './domain/game.repository.js';
import { PublisherDeletedListener } from './infrastructure/events/publisher-deleted.listener.js';
import { GameModel, GameSchema } from './infrastructure/persistence/game.schema.js';
import { MongoGameRepository } from './infrastructure/persistence/mongo-game.repository.js';
import { GamesController } from './presentation/games.controller.js';

@Module({
  imports: [
    PublishersModule,
    MongooseModule.forFeature([{ name: GameModel.name, schema: GameSchema }]),
  ],
  controllers: [GamesController],
  providers: [
    { provide: GAME_REPOSITORY, useClass: MongoGameRepository },
    {
      provide: CatalogLifecyclePolicy,
      useFactory: (): CatalogLifecyclePolicy => new CatalogLifecyclePolicy(),
    },
    CreateGameUseCase,
    UpdateGameUseCase,
    DeleteGameUseCase,
    GetGameUseCase,
    ListGamesUseCase,
    GetGamePublisherUseCase,
    RunCatalogMaintenanceUseCase,
    DetachPublisherFromGamesUseCase,
    PublisherDeletedListener,
  ],
})
export class GamesModule {}
