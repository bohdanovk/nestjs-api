import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import type { Clock } from '../../../../shared/domain/index.js';
import { CLOCK } from '../../../../shared/domain/index.js';
import { CatalogLifecyclePolicy } from '../../domain/catalog-lifecycle-policy.js';
import type { Game } from '../../domain/game.js';
import type { GameRepository } from '../../domain/game.repository.js';
import { GAME_REPOSITORY } from '../../domain/game.repository.js';

export interface CatalogMaintenanceReport {
  readonly retiredCount: number;
  readonly discountedGames: readonly Game[];
}

/**
 * Applies the catalog ageing rules: retires games older than the retirement age and
 * discounts (once) games that entered the discount window.
 */
@Injectable()
export class RunCatalogMaintenanceUseCase implements UseCase<void, CatalogMaintenanceReport> {
  constructor(
    @Inject(GAME_REPOSITORY) private readonly games: GameRepository,
    @Inject(CatalogLifecyclePolicy) private readonly policy: CatalogLifecyclePolicy,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(): Promise<CatalogMaintenanceReport> {
    const now = this.clock.now();

    const retiredCount = await this.games.deleteReleasedBefore(this.policy.retirementCutoff(now));

    const candidates = await this.games.findDiscountCandidates(this.policy.discountWindow(now));
    for (const game of candidates) {
      game.applyDiscount(this.policy.discountPercentage, now);
    }
    await this.games.saveAll(candidates);

    return { retiredCount, discountedGames: candidates };
  }
}
