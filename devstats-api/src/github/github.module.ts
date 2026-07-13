import { Module } from '@nestjs/common';
import { GithubHttpRepository } from './infrastructure/github-http.repository';

@Module({
  providers: [GithubHttpRepository],
  exports: [GithubHttpRepository],
})
export class GithubModule {}