import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type PublisherDocument = Publisher & Document;

@Schema()
export class Publisher {
  @ApiProperty({ example: 'The publisher name', description: 'Publisher name' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    example: '73282932000074',
    description: 'The SIRET code',
  })
  @Prop({ required: true })
  siret: number;

  @ApiProperty({
    example: '18887770446',
    description: 'Phone number',
  })
  @Prop({ required: true })
  phone: string;
}

export const PublisherSchema = SchemaFactory.createForClass(Publisher);
