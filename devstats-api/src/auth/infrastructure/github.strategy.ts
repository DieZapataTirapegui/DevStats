import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/domain/user.entity';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    config: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      clientID: config.get('GITHUB_CLIENT_ID'),
      clientSecret: config.get('GITHUB_CLIENT_SECRET'),
      callbackURL: config.get('GITHUB_CALLBACK_URL'),
      scope: ['user:email', 'read:user', 'repo'],
    } as any);
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: any,
  ): Promise<User> {
    const { id, username, photos, emails } = profile;

    let user = await this.userRepository.findOne({
      where: { githubId: String(id) },
    });

    if (!user) {
      user = this.userRepository.create({
        githubId: String(id),
        username,
        email: emails?.[0]?.value ?? null,
        avatarUrl: photos?.[0]?.value ?? null,
        accessToken,
      });
    } else {
      user.accessToken = accessToken;
      user.avatarUrl = photos?.[0]?.value ?? null;
    }

    return this.userRepository.save(user);
  }
}