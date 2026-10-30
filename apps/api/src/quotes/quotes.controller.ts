import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiKeyGuard } from './api-key.guard.js';
import { CreateQuoteDto } from './dto/create-quote.dto.js';
import { ListQuotesQuery, QuoteIdParam, RandomQuoteQuery } from './dto/list-quotes.query.js';
import { ErrorDto, PaginatedQuotesDto, QUOTE_EXAMPLE, QuoteDto } from './dto/quote.dto.js';
import { QuotesService } from './quotes.service.js';

@ApiTags('quotes')
@ApiExtraModels(PaginatedQuotesDto, QuoteDto)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotes: QuotesService) {}

  @Get()
  @ApiOperation({ summary: 'List quotes with pagination, filters and sorting' })
  @ApiOkResponse({
    description: 'A page of quotes plus pagination metadata.',
    schema: {
      example: {
        data: [QUOTE_EXAMPLE],
        meta: { page: 1, limit: 20, total: 64, totalPages: 4 },
      },
      allOf: [{ $ref: getSchemaPath(PaginatedQuotesDto) }],
    },
  })
  @ApiBadRequestResponse({ type: ErrorDto, description: 'Invalid query parameter.' })
  list(@Query() query: ListQuotesQuery): Promise<PaginatedQuotesDto> {
    return this.quotes.list(query);
  }

  // Declared before ":id" so that "random" is not parsed as an id.
  @Get('random')
  @ApiOperation({ summary: 'Get one random quote, optionally filtered by category or author' })
  @ApiOkResponse({ type: QuoteDto, example: QUOTE_EXAMPLE })
  @ApiNotFoundResponse({ type: ErrorDto, description: 'No quote matches the filters.' })
  random(@Query() query: RandomQuoteQuery): Promise<QuoteDto> {
    return this.quotes.random(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one quote by id' })
  @ApiOkResponse({ type: QuoteDto, example: QUOTE_EXAMPLE })
  @ApiBadRequestResponse({ type: ErrorDto, description: 'The id is not a positive integer.' })
  @ApiNotFoundResponse({
    type: ErrorDto,
    example: { statusCode: 404, error: 'Not Found', message: 'Quote 9999 not found' },
  })
  findOne(@Param() params: QuoteIdParam): Promise<QuoteDto> {
    return this.quotes.findOne(params.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Add a quote (requires x-api-key)' })
  @ApiBody({
    type: CreateQuoteDto,
    examples: {
      english: {
        summary: 'English quote',
        value: { text: 'Knowledge is power.', author: 'Francis Bacon', category: 'science', language: 'en' },
      },
      latin: {
        summary: 'Latin quote',
        value: { text: 'Veni, vidi, vici.', author: 'Julius Caesar', category: 'politics', language: 'la' },
      },
    },
  })
  @ApiCreatedResponse({ type: QuoteDto, example: QUOTE_EXAMPLE })
  @ApiBadRequestResponse({ type: ErrorDto, description: 'Validation failed.' })
  @ApiUnauthorizedResponse({ type: ErrorDto, description: 'Missing or invalid x-api-key header.' })
  @ApiConflictResponse({ type: ErrorDto, description: 'The same text and author already exist.' })
  create(@Body() dto: CreateQuoteDto): Promise<QuoteDto> {
    return this.quotes.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Delete a quote by id (requires x-api-key)' })
  @ApiNoContentResponse({ description: 'The quote was deleted.' })
  @ApiUnauthorizedResponse({ type: ErrorDto, description: 'Missing or invalid x-api-key header.' })
  @ApiNotFoundResponse({ type: ErrorDto, description: 'No quote with that id.' })
  async remove(@Param() params: QuoteIdParam): Promise<void> {
    await this.quotes.remove(params.id);
  }
}
