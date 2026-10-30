import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiTags('meta')
  @ApiOperation({ summary: 'Describe the API and its endpoints' })
  describe() {
    return this.appService.describe();
  }

  @Get('health')
  @ApiTags('meta')
  @ApiOperation({ summary: 'Health check, including database status' })
  health() {
    return this.appService.health();
  }

  @Get('items')
  listItems() {
    return this.appService.listItems();
  }

  @Post('items')
  addItem(@Body() body: { title?: string }) {
    const title = body?.title?.trim();
    if (!title) throw new BadRequestException('title is required');
    return this.appService.addItem(title);
  }
}
