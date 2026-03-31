import { apiFetch } from './client';
import type { FeedResponse } from '../types';

export function fetchFeed(limit = 50, offset = 0, infratuzilma = ''): Promise<FeedResponse> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (infratuzilma) params.set('infratuzilma', infratuzilma);
  return apiFetch<FeedResponse>(`/feed/?${params}`);
}
