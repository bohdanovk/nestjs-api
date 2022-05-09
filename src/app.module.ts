import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GamesModule } from './api/games/games.module';
import { PublishersModule } from './api/publishers/publishers.module';

const Config = ConfigModule.forRoot({
  envFilePath: `.${process.env.NODE_ENV}.env`,
});

@Module({
  imports: [
    Config,
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGODB_URL || 'localhost'}:27017/${
        process.env.MONGODB_DATABASE
      }`,
    ),
    GamesModule,
    PublishersModule,
  ],
})
export class AppModule {}
