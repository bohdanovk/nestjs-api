import { AggregateRoot } from '../../../shared/domain/index.js';
import { GameAlreadyDiscountedError } from './game.errors.js';
import { GameId } from './game-id.js';
import { PublisherRef } from './publisher-ref.js';
import { Discount } from './value-objects/discount.js';
import { GameTitle } from './value-objects/game-title.js';
import { Price } from './value-objects/price.js';
import { Tags } from './value-objects/tags.js';

export interface GameDetails {
  readonly title: string;
  /** Price in major units, e.g. 19.99. */
  readonly price: number;
  readonly tags: readonly string[];
  readonly releaseDate: Date;
  readonly publisherId: string | null;
}

export interface GameProps {
  readonly title: GameTitle;
  readonly price: Price;
  readonly tags: Tags;
  readonly releaseDate: Date;
  readonly publisherId: PublisherRef | null;
  readonly discount: Discount | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Game extends AggregateRoot<GameId> {
  private props: GameProps;

  private constructor(id: GameId, props: GameProps) {
    super(id);
    this.props = props;
  }

  static create(details: GameDetails, now: Date): Game {
    return new Game(GameId.generate(), {
      ...Game.propsFromDetails(details),
      discount: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Rebuilds an aggregate from persisted state. Performs no validation. */
  static reconstitute(id: GameId, props: GameProps): Game {
    return new Game(id, props);
  }

  private static propsFromDetails(
    details: GameDetails,
  ): Pick<GameProps, 'title' | 'price' | 'tags' | 'releaseDate' | 'publisherId'> {
    return {
      title: GameTitle.create(details.title),
      price: Price.fromDecimal(details.price),
      tags: Tags.create(details.tags),
      releaseDate: new Date(details.releaseDate.getTime()),
      publisherId: details.publisherId === null ? null : PublisherRef.create(details.publisherId),
    };
  }

  get title(): GameTitle {
    return this.props.title;
  }

  get price(): Price {
    return this.props.price;
  }

  get tags(): Tags {
    return this.props.tags;
  }

  get releaseDate(): Date {
    return this.props.releaseDate;
  }

  get publisherId(): PublisherRef | null {
    return this.props.publisherId;
  }

  get discount(): Discount | null {
    return this.props.discount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get isDiscounted(): boolean {
    return this.props.discount !== null;
  }

  /**
   * Full replacement of the editable details (PUT semantics).
   * An explicit price change supersedes any automatic discount.
   */
  update(details: GameDetails, now: Date): void {
    const next = Game.propsFromDetails(details);
    const priceChanged = !next.price.equals(this.props.price);
    this.props = {
      ...this.props,
      ...next,
      discount: priceChanged ? null : this.props.discount,
      updatedAt: now,
    };
  }

  /** Reduces the price once; a game cannot be discounted twice. */
  applyDiscount(percentage: number, now: Date): void {
    if (this.props.discount !== null) {
      throw new GameAlreadyDiscountedError(this.id.value);
    }
    const discount = Discount.create(percentage, now);
    this.props = {
      ...this.props,
      price: this.props.price.discountedBy(discount.percentage),
      discount,
      updatedAt: now,
    };
  }

  detachPublisher(now: Date): void {
    if (this.props.publisherId === null) return;
    this.props = { ...this.props, publisherId: null, updatedAt: now };
  }

  wasReleasedBefore(date: Date): boolean {
    return this.props.releaseDate.getTime() < date.getTime();
  }
}
