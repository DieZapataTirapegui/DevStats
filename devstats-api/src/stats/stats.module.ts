import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/domain/user.entity';
import { GithubModule } from '../github/github.module';
import { StatsService } from './application/stats.service';
import { StatsController } from './infrastructure/stats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), GithubModule],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}