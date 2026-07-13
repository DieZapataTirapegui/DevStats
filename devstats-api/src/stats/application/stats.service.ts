import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { GithubHttpRepository } from '../../github/infrastructure/github-http.repository';

@Injectable()
export class StatsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly githubRepo: GithubHttpRepository,
  ) {}

  async getOverview(userId: number) {
    const cacheKey = `stats:overview:${userId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const [profile, repos] = await Promise.all([
      this.githubRepo.getProfile(user.accessToken),
      this.githubRepo.getRepos(user.accessToken),
    ]);

    const languages = await this.githubRepo.getLanguages(
      user.accessToken,
      repos,
    );

    const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
    const languageStats = Object.entries(languages)
      .map(([name, bytes]) => ({
        name,
        percentage: Math.round((bytes / totalBytes) * 100),
        bytes,
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 6);

    const topRepos = repos
      .filter((r) => !r.private)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)
      .map((r) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        url: r.html_url,
        updatedAt: r.updated_at,
      }));

    const result = {
      profile: {
        username: profile.login,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        publicRepos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
        memberSince: new Date(profile.created_at).getFullYear(),
      },
      totalRepos: repos.length,
      topLanguages: languageStats,
      topRepos,
    };

    await this.cacheManager.set(cacheKey, result);
    return result;
  }

  async clearCache(userId: number) {
    await this.cacheManager.del(`stats:overview:${userId}`);
    return { message: 'Cache cleared' };
  }
}