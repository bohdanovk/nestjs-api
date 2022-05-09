import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePublisherDto {
  @ApiProperty({ example: 'The publisher name', description: 'Publisher name' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  readonly name: string;

  @ApiProperty({
    example: '73282932000074',
    description: 'The SIRET code',
  })
  readonly siret: number;

  @ApiProperty({
    example: '+18887770446',
    description: 'Phone number',
  })
  @IsPhoneNumber()
  readonly phone: string;
}
