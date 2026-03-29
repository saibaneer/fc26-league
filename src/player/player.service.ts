import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './player.entity';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepo: Repository<Player>,
  ) {}

  async create(username: string): Promise<Player> {
    const existing = await this.playerRepo.findOne({ where: { username } });
    if (existing) {
      throw new ConflictException(`Player "${username}" already exists`);
    }
    const player = this.playerRepo.create({ username });
    return this.playerRepo.save(player);
  }

  async findAll(): Promise<Player[]> {
    return this.playerRepo.find({ order: { username: 'ASC' } });
  }

  async findByIds(ids: number[]): Promise<Player[]> {
    return this.playerRepo.findByIds(ids);
  }
}
