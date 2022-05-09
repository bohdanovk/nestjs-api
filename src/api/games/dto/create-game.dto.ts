import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateGameDto {
  @ApiProperty({ example: 'The best game', description: 'Game title' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  readonly title: string;

  @ApiProperty({
    example: '100',
    description: 'Game price. Provide 0 when it is free',
  })
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999)
  readonly price: number;

  @ApiPropertyOptional({
    example: ['action', 'vr'],
    description: 'List of the game tags',
  })
  @IsOptional()
  @ArrayUnique()
  @IsArray()
  readonly tags: string[];

  @ApiProperty({
    example: '2022-05-09T19:11:41.740Z',
    description: 'String representation of a date',
  })
  @IsDateString()
  readonly releaseDate: string;

  @ApiPropertyOptional({
    example: '6279688ab9e8a89d6cb50e53',
    description: 'The publisher ID',
  })
  @IsMongoId()
  @IsOptional()
  readonly publisherId: string;
}
