import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  GithubRepo,
  GithubCommit,
  GithubProfile,
} from '../domain/github.interfaces';

@Injectable()
export class GithubHttpRepository {
  private readonly baseUrl = 'https://api.github.com';

  private getHeaders(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    };
  }

  async getProfile(accessToken: string): Promise<GithubProfile> {
    const { data } = await axios.get(`${this.baseUrl}/user`, {
      headers: this.getHeaders(accessToken),
    });
    return data;
  }

  async getRepos(accessToken: string): Promise<GithubRepo[]> {
    const { data } = await axios.get(
      `${this.baseUrl}/user/repos?per_page=100&sort=updated`,
      { headers: this.getHeaders(accessToken) },
    );
    return data;
  }

  async getCommits(
    accessToken: string,
    username: string,
    since: string,
  ): Promise<GithubCommit[]> {
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/search/commits?q=author:${username}&sort=author-date&order=desc&per_page=100`,
        {
          headers: {
            ...this.getHeaders(accessToken),
            Accept: 'application/vnd.github.cloak-preview+json',
          },
          params: { since },
        },
      );
      return data.items ?? [];
    } catch {
      return [];
    }
  }

  async getLanguages(
    accessToken: string,
    repos: GithubRepo[],
  ): Promise<Record<string, number>> {
    const languageMap: Record<string, number> = {};

    const topRepos = repos.slice(0, 10);

    await Promise.all(
      topRepos.map(async (repo) => {
        try {
          const { data } = await axios.get(
            `${this.baseUrl}/repos/${repo.full_name}/languages`,
            { headers: this.getHeaders(accessToken) },
          );
          Object.entries(data).forEach(([lang, bytes]) => {
            languageMap[lang] = (languageMap[lang] ?? 0) + (bytes as number);
          });
        } catch {
          // ignorar repos sin acceso
        }
      }),
    );

    return languageMap;
  }
}