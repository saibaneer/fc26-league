import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fixture } from './fixture.entity';
import { Season } from '../season/season.entity';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class FixtureService {
  constructor(
    @InjectRepository(Fixture)
    private readonly fixtureRepo: Repository<Fixture>,
    @InjectRepository(Season)
    private readonly seasonRepo: Repository<Season>,
    private readonly discord: DiscordService,
  ) {}

  async submitScore(
    fixtureId: number,
    homeScore: number,
    awayScore: number,
    homeTeam?: string,
    awayTeam?: string,
  ): Promise<Fixture> {
    const fixture = await this.fixtureRepo.findOne({
      where: { id: fixtureId },
      relations: ['season', 'homePlayer', 'awayPlayer'],
    });

    if (!fixture) throw new NotFoundException('Fixture not found');
    if (fixture.season.status === 'completed') {
      throw new BadRequestException('Season has ended');
    }

    fixture.homeScore = homeScore;
    fixture.awayScore = awayScore;
    fixture.homeTeam = homeTeam ?? null;
    fixture.awayTeam = awayTeam ?? null;
    fixture.played = true;
    fixture.playedAt = new Date();

    const saved = await this.fixtureRepo.save(fixture);

    // Fire Discord webhook
    await this.discord.sendMatchResult(
      fixture.homePlayer.username,
      fixture.awayPlayer.username,
      homeScore,
      awayScore,
      homeTeam,
      awayTeam,
    );

    return saved;
  }
}
