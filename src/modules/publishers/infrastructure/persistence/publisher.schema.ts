import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'publishers', versionKey: false })
export class PublisherModel {
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: true, unique: true })
  siret!: string;

  @Prop({ type: String, required: true })
  phone!: string;

  @Prop({ type: Date, required: true })
  createdAt!: Date;

  @Prop({ type: Date, required: true })
  updatedAt!: Date;
}

export const PublisherSchema = SchemaFactory.createForClass(PublisherModel);
PublisherSchema.index({ createdAt: -1, _id: 1 });
