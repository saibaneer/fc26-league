import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Season } from './season.entity';
import { Fixture } from '../fixture/fixture.entity';
import { Player } from '../player/player.entity';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class SeasonService {
  constructor(
    @InjectRepository(Season)
    private readonly seasonRepo: Repository<Season>,
    @InjectRepository(Fixture)
    private readonly fixtureRepo: Repository<Fixture>,
    @InjectRepository(Player)
    private readonly playerRepo: Repository<Player>,
    private readonly discord: DiscordService,
  ) {}

  async create(
    name: string,
    playerIds: number[],
  ): Promise<Season & { fixtures: Fixture[] }> {
    if (playerIds.length < 2) {
      throw new BadRequestException('Need at least 2 players');
    }

    const players = await this.playerRepo.findByIds(playerIds);
    if (players.length !== playerIds.length) {
      throw new BadRequestException('Some player IDs not found');
    }

    const season = await this.seasonRepo.save(
      this.seasonRepo.create({ name }),
    );

    const fixtures = this.generateRoundRobin(season.id, playerIds);
    const saved = await this.fixtureRepo.save(fixtures);

    return { ...season, fixtures: saved };
  }

  async findOne(id: number): Promise<Season> {
    const season = await this.seasonRepo.findOne({
      where: { id },
      relations: ['fixtures', 'fixtures.homePlayer', 'fixtures.awayPlayer'],
    });
    if (!season) throw new NotFoundException('Season not found');
    return season;
  }

  async findAll(): Promise<Season[]> {
    return this.seasonRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getTable(seasonId: number) {
    const season = await this.findOne(seasonId);
    const playerMap = new Map<
      number,
      {
        playerId: number;
        username: string;
        p: number;
        w: number;
        d: number;
        l: number;
        gf: number;
        ga: number;
        gd: number;
        pts: number;
      }
    >();

    // Collect all players from fixtures
    for (const f of season.fixtures) {
      if (!playerMap.has(f.homePlayerId)) {
        playerMap.set(f.homePlayerId, {
          playerId: f.homePlayerId,
          username: f.homePlayer.username,
          p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0,
        });
      }
      if (!playerMap.has(f.awayPlayerId)) {
        playerMap.set(f.awayPlayerId, {
          playerId: f.awayPlayerId,
          username: f.awayPlayer.username,
          p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0,
        });
      }
    }

    for (const f of season.fixtures) {
      if (!f.played) continue;
      const home = playerMap.get(f.homePlayerId)!;
      const away = playerMap.get(f.awayPlayerId)!;

      home.p++;
      away.p++;
      home.gf += f.homeScore!;
      home.ga += f.awayScore!;
      away.gf += f.awayScore!;
      away.ga += f.homeScore!;

      if (f.homeScore! > f.awayScore!) {
        home.w++;
        home.pts += 3;
        away.l++;
      } else if (f.homeScore! < f.awayScore!) {
        away.w++;
        away.pts += 3;
        home.l++;
      } else {
        home.d++;
        away.d++;
        home.pts += 1;
        away.pts += 1;
      }
    }

    const standings = Array.from(playerMap.values()).map((s) => ({
      ...s,
      gd: s.gf - s.ga,
    }));

    standings.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

    return { season: { id: season.id, name: season.name, status: season.status }, standings };
  }

  async endSeason(seasonId: number): Promise<Season> {
    const season = await this.findOne(seasonId);
    if (season.status === 'completed') {
      throw new BadRequestException('Season already ended');
    }

    season.status = 'completed';
    season.completedAt = new Date();
    await this.seasonRepo.save(season);

    // Send final standings to Discord
    const { standings } = await this.getTable(seasonId);
    await this.discord.sendSeasonEnd(season.name, standings);

    return season;
  }

  /**
   * Round-robin with home & away.
   * For n players: 2*(n-1) rounds, n/2 matches per round.
   * Uses the circle method: fix player[0], rotate the rest.
   */
  private generateRoundRobin(
    seasonId: number,
    playerIds: number[],
  ): Partial<Fixture>[] {
    const ids = [...playerIds];
    // If odd number, add a "bye" placeholder (-1)
    if (ids.length % 2 !== 0) {
      ids.push(-1);
    }

    const n = ids.length;
    const halfRounds = n - 1;
    const fixtures: Partial<Fixture>[] = [];
    let roundNum = 1;

    // First leg
    for (let r = 0; r < halfRounds; r++) {
      for (let i = 0; i < n / 2; i++) {
        const home = ids[i];
        const away = ids[n - 1 - i];
        if (home === -1 || away === -1) continue; // skip byes
        fixtures.push({
          seasonId,
          round: roundNum,
          homePlayerId: home,
          awayPlayerId: away,
        });
      }
      roundNum++;
      // Rotate: fix ids[0], rotate the rest
      const last = ids.pop()!;
      ids.splice(1, 0, last);
    }

    // Second leg (reverse home/away)
    for (const f of [...fixtures]) {
      fixtures.push({
        seasonId,
        round: roundNum,
        homePlayerId: f.awayPlayerId,
        awayPlayerId: f.homePlayerId,
      });
      // Advance round every n/2 matches
      if (fixtures.length % (n / 2) === 0) roundNum++;
    }

    // Re-number second leg rounds properly
    const firstLegCount = fixtures.length / 2;
    let secondLegRound = halfRounds + 1;
    let matchInRound = 0;
    const matchesPerRound = (n / 2);
    for (let i = firstLegCount; i < fixtures.length; i++) {
      fixtures[i].round = secondLegRound;
      matchInRound++;
      if (matchInRound === matchesPerRound) {
        matchInRound = 0;
        secondLegRound++;
      }
    }

    return fixtures;
  }
}
