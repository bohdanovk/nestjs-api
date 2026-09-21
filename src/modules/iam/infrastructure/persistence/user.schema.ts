import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { Role } from '../../../../shared/domain/index.js';
import { ALL_ROLES } from '../../../../shared/domain/index.js';

@Schema({ collection: 'users', versionKey: false })
export class UserModel {
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ type: String, required: true, unique: true })
  email!: string;

  @Prop({ type: String, required: true })
  passwordHash!: string;

  @Prop({ type: String, required: true, enum: ALL_ROLES })
  role!: Role;

  @Prop({ type: String, default: null })
  refreshTokenId!: string | null;

  @Prop({ type: Date, required: true })
  createdAt!: Date;

  @Prop({ type: Date, required: true })
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
