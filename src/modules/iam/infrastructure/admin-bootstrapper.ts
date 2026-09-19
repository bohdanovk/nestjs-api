import type { OnApplicationBootstrap } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';

import { AppConfig } from '../../../config/index.js';
import { EnsureAdminUserUseCase } from '../application/use-cases/ensure-admin-user.use-case.js';

/** Creates the initial admin account from configuration, once, on start-up. */
@Injectable()
export class AdminBootstrapper implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminBootstrapper.name);

  constructor(
    private readonly config: AppConfig,
    private readonly ensureAdmin: EnsureAdminUserUseCase,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const admin = this.config.auth.bootstrapAdmin;
    if (admin === null) return;

    const created = await this.ensureAdmin.execute(admin);
    if (created) {
      this.logger.log({ email: admin.email }, 'Bootstrap admin account created');
    }
  }
}
