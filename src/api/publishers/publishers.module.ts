import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublishersService } from './publishers.service';
import { PublishersController } from './publishers.controller';
import { Publisher, PublisherSchema } from './schemas/publisher.schema';

@Module({
  providers: [PublishersService],
  controllers: [PublishersController],
  imports: [
    MongooseModule.forFeature([
      { name: Publisher.name, schema: PublisherSchema },
    ]),
  ],
  exports: [PublishersService],
})
export class PublishersModule {}
