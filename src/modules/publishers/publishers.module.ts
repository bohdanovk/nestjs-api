import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PUBLISHER_LOOKUP } from './application/ports/publisher-lookup.js';
import { PublisherLookupService } from './application/publisher-lookup.service.js';
import { CreatePublisherUseCase } from './application/use-cases/create-publisher.use-case.js';
import { DeletePublisherUseCase } from './application/use-cases/delete-publisher.use-case.js';
import { GetPublisherUseCase } from './application/use-cases/get-publisher.use-case.js';
import { ListPublishersUseCase } from './application/use-cases/list-publishers.use-case.js';
import { UpdatePublisherUseCase } from './application/use-cases/update-publisher.use-case.js';
import { PUBLISHER_REPOSITORY } from './domain/publisher.repository.js';
import { MongoPublisherRepository } from './infrastructure/persistence/mongo-publisher.repository.js';
import { PublisherModel, PublisherSchema } from './infrastructure/persistence/publisher.schema.js';
import { PublishersController } from './presentation/publishers.controller.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: PublisherModel.name, schema: PublisherSchema }])],
  controllers: [PublishersController],
  providers: [
    { provide: PUBLISHER_REPOSITORY, useClass: MongoPublisherRepository },
    { provide: PUBLISHER_LOOKUP, useClass: PublisherLookupService },
    CreatePublisherUseCase,
    UpdatePublisherUseCase,
    DeletePublisherUseCase,
    GetPublisherUseCase,
    ListPublishersUseCase,
  ],
  exports: [PUBLISHER_LOOKUP],
})
export class PublishersModule {}
