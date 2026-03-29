import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { PlayerService } from './player.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('api/players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body('username') username: string) {
    return this.playerService.create(username);
  }

  @Get()
  findAll() {
    return this.playerService.findAll();
  }
}
