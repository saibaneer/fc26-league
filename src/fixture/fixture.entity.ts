import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Season } from '../season/season.entity';
import { Player } from '../player/player.entity';

@Entity()
export class Fixture {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Season, (season) => season.fixtures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seasonId' })
  season: Season;

  @Column()
  seasonId: number;

  @Column()
  round: number;

  @ManyToOne(() => Player, { eager: true })
  @JoinColumn({ name: 'homePlayerId' })
  homePlayer: Player;

  @Column()
  homePlayerId: number;

  @ManyToOne(() => Player, { eager: true })
  @JoinColumn({ name: 'awayPlayerId' })
  awayPlayer: Player;

  @Column()
  awayPlayerId: number;

  @Column({ type: 'int', nullable: true })
  homeScore: number | null;

  @Column({ type: 'int', nullable: true })
  awayScore: number | null;

  @Column({ type: 'varchar', nullable: true })
  homeTeam: string | null;

  @Column({ type: 'varchar', nullable: true })
  awayTeam: string | null;

  @Column({ default: false })
  played: boolean;

  @Column({ type: 'timestamp', nullable: true })
  playedAt: Date | null;
}
