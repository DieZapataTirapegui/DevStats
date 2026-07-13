import { Controller, Get, Delete, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StatsService } from '../application/stats.service';

@Controller('stats')
@UseGuards(AuthGuard('jwt'))
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  async getOverview(@Req() req: any) {
    return this.statsService.getOverview(req.user.sub);
  }

  @Delete('cache')
  async clearCache(@Req() req: any) {
    return this.statsService.clearCache(req.user.sub);
  }
}