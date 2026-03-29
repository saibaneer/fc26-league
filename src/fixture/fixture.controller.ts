import { Controller, Patch, Param, Body } from '@nestjs/common';
import { FixtureService } from './fixture.service';

@Controller('api/fixtures')
export class FixtureController {
  constructor(private readonly fixtureService: FixtureService) {}

  @Patch(':id')
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
