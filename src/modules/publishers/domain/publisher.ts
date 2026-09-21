import { AggregateRoot } from '../../../shared/domain/index.js';
import { PublisherDeletedEvent } from './events/publisher-deleted.event.js';
import { PublisherId } from './publisher-id.js';
import { PhoneNumber } from './value-objects/phone-number.js';
import { PublisherName } from './value-objects/publisher-name.js';
import { Siret } from './value-objects/siret.js';

export interface PublisherDetails {
  readonly name: string;
  readonly siret: string;
  readonly phone: string;
}

export interface PublisherProps {
  readonly name: PublisherName;
  readonly siret: Siret;
  readonly phone: PhoneNumber;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Publisher extends AggregateRoot<PublisherId> {
  private props: PublisherProps;

  private constructor(id: PublisherId, props: PublisherProps) {
    super(id);
    this.props = props;
  }

  static create(details: PublisherDetails, now: Date): Publisher {
    return new Publisher(PublisherId.generate(), {
      name: PublisherName.create(details.name),
      siret: Siret.create(details.siret),
      phone: PhoneNumber.create(details.phone),
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Rebuilds an aggregate from persisted state. Performs no validation. */
  static reconstitute(id: PublisherId, props: PublisherProps): Publisher {
    return new Publisher(id, props);
  }

  get name(): PublisherName {
    return this.props.name;
  }

  get siret(): Siret {
    return this.props.siret;
  }

  get phone(): PhoneNumber {
    return this.props.phone;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** Full replacement of the mutable details (PUT semantics). */
  update(details: PublisherDetails, now: Date): void {
    this.props = {
      ...this.props,
      name: PublisherName.create(details.name),
      siret: Siret.create(details.siret),
      phone: PhoneNumber.create(details.phone),
      updatedAt: now,
    };
  }

  /** Records the deletion so dependent contexts (e.g. games) can react. */
  markDeleted(now: Date): void {
    this.recordEvent(new PublisherDeletedEvent(this.id.value, now));
  }
}
