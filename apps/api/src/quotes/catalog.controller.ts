import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthorCountDto, CategoryCountDto } from './dto/quote.dto.js';
import { QuotesService } from './quotes.service.js';

@ApiTags('catalog')
@Controller()
export class CatalogController {
  constructor(private readonly quotes: QuotesService) {}

  @Get('authors')
  @ApiOperation({ summary: 'List every author with the number of quotes they have' })
  @ApiOkResponse({
    type: [AuthorCountDto],
    example: [
      { author: 'Albert Einstein', count: 1 },
      { author: 'William Shakespeare', count: 10 },
    ],
  })
  authors(): Promise<AuthorCountDto[]> {
    return this.quotes.authors();
  }

  @Get('categories')
  @ApiOperation({ summary: 'List every category with the number of quotes in it' })
  @ApiOkResponse({
    type: [CategoryCountDto],
    example: [
      { category: 'literature', count: 17 },
      { category: 'philosophy', count: 8 },
    ],
  })
  categories(): Promise<CategoryCountDto[]> {
    return this.quotes.categories();
  }
}
