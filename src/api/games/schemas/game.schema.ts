import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Publisher } from '../../publishers/schemas/publisher.schema';
import { Type } from 'class-transformer';

export type GameDocument = Game & Document;

@Schema()
export class Game {
  @ApiProperty({
    example: 'The best game',
    description: 'Game title',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    example: '100',
    description: 'Game price. Provide 0 when it is free',
  })
  @Prop({ required: true })
  price: number;

  @ApiProperty({
    description: 'The publisher of the game',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Publisher.name,
  })
  @Type(() => Publisher)
  publisher: Publisher;

  @ApiPropertyOptional({
    example: ['action', 'vr'],
    description: 'List of the game tags',
  })
  @Prop([String])
  tags: string[];

  @ApiProperty({
    example: '1652106429241',
    description: 'String representation of a date',
  })
  @Prop({ required: true })
  releaseDate: Date;
}

export const GameSchema = SchemaFactory.createForClass(Game);
