import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { SeasonService } from './season.service';

@Controller('api/seasons')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Post()
  create(@Body() body: { name: string; playerIds: number[] }) {
    return this.seasonService.create(body.name, body.playerIds);
  }

  @Get()
  findAll() {
    return this.seasonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seasonService.findOne(+id);
  }

  @Get(':id/table')
  getTable(@Param('id') id: string) {
    return this.seasonService.getTable(+id);
  }

  @Patch(':id/end')
  endSeason(@Param('id') id: string) {
    return this.seasonService.endSeason(+id);
  }
}
