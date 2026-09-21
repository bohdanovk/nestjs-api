import { Global, Module } from '@nestjs/common';

import { AppConfig } from './app-config.js';
import { loadConfig } from './load-config.js';

@Global()
@Module({
  providers: [{ provide: AppConfig, useFactory: (): AppConfig => loadConfig() }],
  exports: [AppConfig],
})
export class ConfigModule {}
