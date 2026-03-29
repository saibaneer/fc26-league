import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from './season.entity';
import { Fixture } from '../fixture/fixture.entity';
import { Player } from '../player/player.entity';
import { SeasonService } from './season.service';
import { SeasonController } from './season.controller';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Season, Fixture, Player]),
    DiscordModule,
  ],
  controllers: [SeasonController],
  providers: [SeasonService],
})
export class SeasonModule {}
