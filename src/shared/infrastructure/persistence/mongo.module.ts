import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppConfig } from '../../../config/index.js';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        uri: config.database.uri,
        serverSelectionTimeoutMS: 5_000,
        // Indexes are declared on the schemas; keep them in sync automatically.
        autoIndex: true,
      }),
    }),
  ],
})
export class MongoModule {}
