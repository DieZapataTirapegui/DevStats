import { api } from "./api";

export interface StatsOverview {
  profile: {
    username: string;
    name: string;
    avatarUrl: string;
    bio: string | null;
    publicRepos: number;
    followers: number;
    following: number;
    memberSince: number;
  };
  totalRepos: number;
  topLanguages: {
    name: string;
    percentage: number;
    bytes: number;
  }[];
  topRepos: {
    name: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    url: string;
    updatedAt: string;
  }[];
}

export const getOverview = async (): Promise<StatsOverview> => {
  const response = await api.get("/stats/overview");
  return response.data;
};

export const clearCache = async () => {
  const response = await api.delete("/stats/cache");
  return response.data;
};