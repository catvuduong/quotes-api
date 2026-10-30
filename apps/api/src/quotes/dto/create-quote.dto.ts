import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { trimmed } from '../../common/transforms.js';

export class CreateQuoteDto {
  // Max 500 chars keeps (text, author) under Postgres' btree index size limit, which the unique index relies on.
  @ApiProperty({ maxLength: 500, example: 'Knowledge is power.' })
  @Transform(trimmed)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text: string;

  @ApiProperty({ maxLength: 100, example: 'Francis Bacon' })
  @Transform(trimmed)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  author: string;

  @ApiProperty({ maxLength: 50, example: 'science', description: 'Stored in lower case.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category: string;

  @ApiPropertyOptional({
    example: 'en',
    default: 'en',
    description: 'Two or three letter lowercase language code.',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @Matches(/^[a-z]{2,3}$/, { message: 'language must be a two or three letter lowercase code' })
  language: string = 'en';
}
