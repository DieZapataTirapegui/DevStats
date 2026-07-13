import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/domain/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      githubId: user.githubId,
    };
    return this.jwtService.sign(payload);
  }
}