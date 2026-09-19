import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class DiscountModel {
  @Prop({ type: Number, required: true })
  percentage!: number;

  @Prop({ type: Date, required: true })
  appliedAt!: Date;
}

const DiscountSchema = SchemaFactory.createForClass(DiscountModel);

@Schema({ collection: 'games', versionKey: false })
export class GameModel {
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ type: String, required: true })
  title!: string;

  /** Integer minor units (cents). */
  @Prop({ type: Number, required: true })
  priceCents!: number;

  @Prop({ type: [String], required: true, default: [] })
  tags!: string[];

  @Prop({ type: Date, required: true })
  releaseDate!: Date;

  @Prop({ type: String, default: null })
  publisherId!: string | null;

  @Prop({ type: DiscountSchema, default: null })
  discount!: DiscountModel | null;

  @Prop({ type: Date, required: true })
  createdAt!: Date;

  @Prop({ type: Date, required: true })
  updatedAt!: Date;
}

export const GameSchema = SchemaFactory.createForClass(GameModel);
GameSchema.index({ releaseDate: 1 });
GameSchema.index({ publisherId: 1 });
GameSchema.index({ createdAt: -1, _id: 1 });
