import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { trimmed } from '../../common/transforms.js';

export const QUOTE_SORT_FIELDS = ['id', 'created_at', 'author', 'category'] as const;
export type QuoteSortField = (typeof QUOTE_SORT_FIELDS)[number];

export class ListQuotesQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100, example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ example: 'Socrates', description: 'Exact author name, case-insensitive.' })
  @IsOptional()
  @Transform(trimmed)
  @IsString()
  @MaxLength(100)
  author?: string;

  @ApiPropertyOptional({ example: 'philosophy', description: 'Exact category, case-insensitive.' })
  @IsOptional()
  @Transform(trimmed)
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({
    example: 'stage',
    description: 'Case-insensitive substring match on the quote text.',
  })
  @IsOptional()
  @Transform(trimmed)
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({ enum: QUOTE_SORT_FIELDS, default: 'id', example: 'author' })
  @IsOptional()
  @IsIn(QUOTE_SORT_FIELDS)
  sort: QuoteSortField = 'id';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc', example: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';
}

export class RandomQuoteQuery {
  @ApiPropertyOptional({ example: 'science', description: 'Only pick from this category.' })
  @IsOptional()
  @Transform(trimmed)
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({ example: 'Albert Einstein', description: 'Only pick from this author.' })
  @IsOptional()
  @Transform(trimmed)
  @IsString()
  @MaxLength(100)
  author?: string;
}

export class QuoteIdParam {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  // 2147483647 is the largest id a SERIAL column can hold; anything bigger would fail inside Postgres.
  @Max(2147483647)
  id: number;
}
