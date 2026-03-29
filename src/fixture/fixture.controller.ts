import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { FixtureService } from './fixture.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('api/fixtures')
export class FixtureController {
  constructor(private readonly fixtureService: FixtureService) {}

  @Patch(':id')
  @UseGuards(AdminGuard)
  submitScore(
    @Param('id') id: string,
    @Body()
    body: {
      homeScore: number;
      awayScore: number;
      homeTeam?: string;
      awayTeam?: string;
    },
  ) {
    return this.fixtureService.submitScore(
      +id,
      body.homeScore,
      body.awayScore,
      body.homeTeam,
      body.awayTeam,
    );
  }
}
