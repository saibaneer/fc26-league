import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fixture } from './fixture.entity';
import { Season } from '../season/season.entity';
import { FixtureService } from './fixture.service';
import { FixtureController } from './fixture.controller';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [TypeOrmModule.forFeature([Fixture, Season]), DiscordModule],
  controllers: [FixtureController],
  providers: [FixtureService],
})
export class FixtureModule {}
