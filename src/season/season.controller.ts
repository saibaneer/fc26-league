import { Controller, Post, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SeasonService } from './season.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('api/seasons')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Post()
  @UseGuards(AdminGuard)
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
  @UseGuards(AdminGuard)
  endSeason(@Param('id') id: string) {
    return this.seasonService.endSeason(+id);
  }
}
