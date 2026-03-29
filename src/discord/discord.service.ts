import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);
  private readonly webhookUrl: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.webhookUrl = this.config.get<string>('DISCORD_WEBHOOK_URL');
  }

  async sendMatchResult(
    homePlayer: string,
    awayPlayer: string,
    homeScore: number,
    awayScore: number,
    homeTeam?: string | null,
    awayTeam?: string | null,
  ): Promise<void> {
    if (!this.webhookUrl) {
      this.logger.warn('DISCORD_WEBHOOK_URL not set, skipping notification');
      return;
    }

    const homeLine = homeTeam
      ? `**${homePlayer}** (${homeTeam})`
      : `**${homePlayer}**`;
    const awayLine = awayTeam
      ? `**${awayPlayer}** (${awayTeam})`
      : `**${awayPlayer}**`;

    const embed = {
      embeds: [
        {
          title: '⚽ FC26 League Result',
          description: `${homeLine}  **${homeScore}** - **${awayScore}**  ${awayLine}`,
          color: 0x00cc88,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embed),
      });
    } catch (err) {
      this.logger.error('Failed to send Discord webhook', err);
    }
  }

  async sendSeasonEnd(
    seasonName: string,
    standings: { username: string; pts: number; gd: number }[],
  ): Promise<void> {
    if (!this.webhookUrl) return;

    const lines = standings.map(
      (s, i) => `**${i + 1}.** ${s.username} — ${s.pts} pts (GD: ${s.gd >= 0 ? '+' : ''}${s.gd})`,
    );

    const embed = {
      embeds: [
        {
          title: `🏆 FC26 Season "${seasonName}" — Final Standings`,
          description:
            lines.join('\n') + `\n\n👑 **Champion: ${standings[0].username}**`,
          color: 0xffd700,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embed),
      });
    } catch (err) {
      this.logger.error('Failed to send Discord webhook', err);
    }
  }
}
