import type { Page } from '../../../shared/domain/index.js';
import type { CatalogMaintenanceReport } from '../application/use-cases/run-catalog-maintenance.use-case.js';
import type { Game } from '../domain/game.js';
import type { CatalogMaintenanceResponse, GamePage, GameResponse } from './game.schemas.js';

export function toGameResponse(game: Game): GameResponse {
  return {
    id: game.id.value,
    title: game.title.value,
    price: game.price.toDecimal(),
    tags: [...game.tags.value],
    releaseDate: game.releaseDate.toISOString(),
    publisherId: game.publisherId?.value ?? null,
    discount:
      game.discount === null
        ? null
        : {
            percentage: game.discount.percentage,
            appliedAt: game.discount.appliedAt.toISOString(),
          },
    createdAt: game.createdAt.toISOString(),
    updatedAt: game.updatedAt.toISOString(),
  };
}

export function toGamePage(page: Page<Game>): GamePage {
  return {
    items: page.items.map(toGameResponse),
    total: page.total,
    page: page.page,
    pageSize: page.pageSize,
  };
}

export function toCatalogMaintenanceResponse(
  report: CatalogMaintenanceReport,
): CatalogMaintenanceResponse {
  return {
    retiredCount: report.retiredCount,
    discountedGames: report.discountedGames.map(toGameResponse),
  };
}
