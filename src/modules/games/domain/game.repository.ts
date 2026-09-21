import type { Page, PageRequest } from '../../../shared/domain/index.js';
import type { DateWindow } from './catalog-lifecycle-policy.js';
import type { Game } from './game.js';
import type { GameId } from './game-id.js';
import type { PublisherRef } from './publisher-ref.js';

export interface GameRepository {
  findById(id: GameId): Promise<Game | null>;
  findPage(request: PageRequest): Promise<Page<Game>>;
  /** Games released inside the window that have not been discounted yet. */
  findDiscountCandidates(window: DateWindow): Promise<Game[]>;
  /** Inserts or fully replaces the aggregate. */
  save(game: Game): Promise<void>;
  saveAll(games: readonly Game[]): Promise<void>;
  /** Returns false when nothing was deleted. */
  delete(id: GameId): Promise<boolean>;
  /** Deletes every game released strictly before `date`; returns the number removed. */
  deleteReleasedBefore(date: Date): Promise<number>;
  /** Clears the publisher reference on every game of that publisher; returns the number changed. */
  detachPublisher(publisherId: PublisherRef, now: Date): Promise<number>;
}

export const GAME_REPOSITORY = Symbol('GameRepository');
