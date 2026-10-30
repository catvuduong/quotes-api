import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuoteDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'The unexamined life is not worth living.' })
  text: string;

  @ApiProperty({ example: 'Socrates' })
  author: string;

  @ApiProperty({ example: 'philosophy' })
  category: string;

  @ApiProperty({ example: 'en', description: 'ISO 639 language code of the quote text.' })
  language: string;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z', type: String, format: 'date-time' })
  created_at: Date;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 64 })
  total: number;

  @ApiProperty({ example: 4 })
  totalPages: number;
}

export class PaginatedQuotesDto {
  @ApiProperty({ type: [QuoteDto] })
  data: QuoteDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class AuthorCountDto {
  @ApiProperty({ example: 'William Shakespeare' })
  author: string;

  @ApiProperty({ example: 17 })
  count: number;
}

export class CategoryCountDto {
  @ApiProperty({ example: 'literature' })
  category: string;

  @ApiProperty({ example: 17 })
  count: number;
}

export class ErrorDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Not Found' })
  error: string;

  @ApiProperty({ example: 'Quote 9999 not found' })
  message: string;

  @ApiPropertyOptional({ type: [String], example: ['limit must not be greater than 100'] })
  details?: string[];
}

export const QUOTE_EXAMPLE: QuoteDto = {
  id: 1,
  text: 'The unexamined life is not worth living.',
  author: 'Socrates',
  category: 'philosophy',
  language: 'en',
  created_at: new Date('2026-01-15T10:00:00.000Z'),
};
