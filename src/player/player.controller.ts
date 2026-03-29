import { Controller, Post, Get, Body } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('api/players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  create(@Body('username') username: string) {
    return this.playerService.create(username);
  }

  @Get()
  findAll() {
    return this.playerService.findAll();
  }
}
